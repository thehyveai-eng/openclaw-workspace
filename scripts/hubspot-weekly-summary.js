#!/usr/bin/env node
/**
 * HubSpot Weekly Pipeline Summary
 * 
 * Fetches current pipeline state from HubSpot and writes a summary to wiki.
 * Run weekly via cron to keep Mint operations visible.
 * 
 * Usage: node scripts/hubspot-weekly-summary.js
 * Schedule: 0 9 * * 1 (Monday 9am MDT)
 */

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const WIKI_PATH = "/Users/calebsai/.openclaw/workspace/wiki";

async function fetchHubSpotData() {
  const headers = {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    "Content-Type": "application/json"
  };

  // Fetch pipelines and deals
  const [pipelinesRes, dealsRes] = await Promise.all([
    fetch("https://api.hubapi.com/crm/v3/pipelines/deals", { headers }),
    fetch("https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate,pipeline", { headers })
  ]);

  const pipelines = await pipelinesRes.json();
  const dealsData = await dealsRes.json();

  return { pipelines: pipelines.results || [], deals: dealsData.results || [] };
}

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function generateSummary(data) {
  const { pipelines, deals } = data;
  const today = new Date().toISOString().split('T')[0];
  
  let summary = `---
title: HubSpot Weekly Pipeline Summary
created: ${today}
updated: ${today}
tags: [topic, hubspot, pipeline, weekly-report]
---

# HubSpot Weekly Pipeline Summary

_Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}_

## Pipeline Overview

`;

  // Group deals by pipeline
  const pipelineGroups = {};
  for (const pipeline of pipelines) {
    pipelineGroups[pipeline.id] = { name: pipeline.label, stages: {}, deals: [] };
  }

  // Categorize deals
  for (const deal of deals) {
    const pid = deal.pipeline || 'default';
    if (!pipelineGroups[pid]) {
      pipelineGroups[pid] = { name: 'Unknown', stages: {}, deals: [] };
    }
    const stageId = deal.dealstage || 'unknown';
    if (!pipelineGroups[pid].stages[stageId]) {
      pipelineGroups[pid].stages[stageId] = [];
    }
    pipelineGroups[pid].deals.push(deal);
  }

  // Generate summary for each pipeline
  for (const [pid, pipeline] of Object.entries(pipelineGroups)) {
    const stageLabels = {};
    for (const stage of (pipelines.find(p => p.id === pid)?.stages || [])) {
      stageLabels[stage.id] = stage.label;
    }

    const totalDeals = pipeline.deals.length;
    const totalAmount = pipeline.deals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    summary += `### ${pipeline.name}\n`;
    summary += `- **Total deals:** ${totalDeals}\n`;
    summary += `- **Total value:** $${totalAmount.toLocaleString()}\n\n`;

    // Deals by stage
    const byStage = {};
    for (const deal of pipeline.deals) {
      const stage = stageLabels[deal.dealstage] || deal.dealstage || 'Unknown';
      if (!byStage[stage]) byStage[stage] = [];
      byStage[stage].push(deal);
    }

    for (const [stage, stageDeals] of Object.entries(byStage)) {
      const stageAmount = stageDeals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      summary += `- ${stage}: ${stageDeals.length} deals ($${stageAmount.toLocaleString()})\n`;
    }
    summary += `\n`;

    // Stale deals (no activity in 7+ days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleDeals = pipeline.deals.filter(d => {
      if (!d.closedate) return false;
      const closeDate = new Date(d.closedate);
      return closeDate < sevenDaysAgo && !['closedwon', 'closedlost'].includes(d.dealstage);
    });

    if (staleDeals.length > 0) {
      summary += `### ⚠️ Stale Deals (7+ days until close)\n`;
      for (const deal of staleDeals.slice(0, 10)) {
        summary += `- **${deal.dealname}** — ${formatDate(deal.closedate)} (${stageLabels[deal.dealstage] || 'unknown'})\n`;
      }
      if (staleDeals.length > 10) {
        summary += `- _...and ${staleDeals.length - 10} more_\n`;
      }
      summary += `\n`;
    }
  }

  // Hot deals (closing this week)
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const hotDeals = deals.filter(d => {
    if (!d.closedate) return false;
    const closeDate = new Date(d.closedate);
    return closeDate <= weekFromNow && !['closedwon', 'closedlost'].includes(d.dealstage);
  });

  if (hotDeals.length > 0) {
    summary += `## 🔥 Hot Deals (Closing this week)\n\n`;
    for (const deal of hotDeals) {
      const amount = parseFloat(deal.amount) || 0;
      summary += `- **${deal.dealname}** — $${amount.toLocaleString()} — Close: ${formatDate(deal.closedate)}\n`;
    }
    summary += `\n`;
  }

  summary += `---
_This report is auto-generated. Next run: next Monday 9am MDT._
`;

  return summary;
}

async function main() {
  if (!HUBSPOT_TOKEN) {
    console.error("❌ HUBSPOT_TOKEN not set in environment");
    process.exit(1);
  }

  console.log("📊 Fetching HubSpot data...");
  
  try {
    const data = await fetchHubSpotData();
    console.log(`✓ Got ${data.deals.length} deals across ${data.pipelines.length} pipelines`);

    const summary = generateSummary(data);
    
    const outputPath = `${WIKI_PATH}/topics/hubspot-weekly-${new Date().toISOString().split('T')[0]}.md`;
    
    // Also update the main hubspot topic
    const mainPath = `${WIKI_PATH}/topics/hubspot.md`;
    
    // Write timestamped report
    const fs = await import('fs');
    fs.writeFileSync(outputPath, summary);
    console.log(`✓ Wrote: ${outputPath}`);

    // Update/create main hubspot page with latest
    fs.writeFileSync(mainPath, summary);
    console.log(`✓ Updated: ${mainPath}`);

    console.log("\n✅ HubSpot weekly summary complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();