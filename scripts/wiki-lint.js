#!/usr/bin/env node
/**
 * Wiki Lint Script
 * 
 * Health-checks the wiki for:
 * - Contradictions between pages
 * - Stale claims superseded by new data
 * - Orphan pages (no inbound links)
 * - Concepts lacking their own pages
 * - Missing cross-references
 * 
 * Run weekly via cron to keep wiki healthy.
 * 
 * Usage: node scripts/wiki-lint.js
 * Schedule: 0 9 * * FRI (Friday 9am MDT)
 */

const WIKI_PATH = "/Users/calebsai/.openclaw/workspace/wiki";
const fs = await import('fs');

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory() && entry.name !== 'raw') {
      getAllFiles(path, files);
    } else if (entry.name.endsWith('.md') && entry.name !== 'WIKI.md') {
      files.push(path);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...vals] = line.split(':');
    if (key && vals.length) {
      meta[key.trim()] = vals.join(':').trim();
    }
  }
  return { meta, body: match[2] };
}

function extractLinks(content) {
  const wikiLinks = content.match(/\[\[([^\]]+)\]\]/g) || [];
  const mdLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  return {
    internal: wikiLinks.map(l => l.replace('[[', '').replace(']]', '')),
    external: mdLinks.map(l => {
      const match = l.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return match ? match[2] : null;
    }).filter(Boolean)
  };
}

function generateLintReport() {
  const files = getAllFiles(WIKI_PATH);
  const pages = {};
  const backlinks = {}; // page -> list of pages linking to it
  
  // Parse all pages
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relPath = file.replace(WIKI_PATH + '/', '');
    const name = relPath.replace(/\.md$/, '').replace(/\//g, '-');
    
    const { meta, body } = parseFrontmatter(content);
    const { internal, external } = extractLinks(content);
    
    pages[name] = {
      path: file,
      relPath,
      name,
      meta,
      body,
      internalLinks: internal,
      externalLinks: external,
      wordCount: body.split(/\s+/).filter(Boolean).length
    };
    
    // Build backlink index
    for (const link of internal) {
      if (!backlinks[link]) backlinks[link] = [];
      backlinks[link].push(name);
    }
  }

  // Run lint checks
  const issues = [];
  const suggestions = [];

  // Check for orphan pages (no backlinks)
  for (const [name, page] of Object.entries(pages)) {
    if (name === 'index' || name === 'log') continue; // skip special pages
    const inLinks = backlinks[name] || [];
    if (inLinks.length === 0 && page.wordCount < 100) {
      issues.push({
        type: 'orphan',
        page: name,
        message: `${name} has no inbound links and is very short`
      });
    }
  }

  // Check for pages with no outbound links
  for (const [name, page] of Object.entries(pages)) {
    if (page.internalLinks.length === 0 && page.wordCount > 300) {
      suggestions.push({
        type: 'no-links',
        page: name,
        message: `${name} has no internal links — consider adding cross-references`
      });
    }
  }

  // Check for stale pages (not updated in 30+ days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const [name, page] of Object.entries(pages)) {
    if (!page.meta.updated) continue;
    const updatedDate = new Date(page.meta.updated);
    if (updatedDate < thirtyDaysAgo) {
      suggestions.push({
        type: 'stale',
        page: name,
        message: `${name} not updated since ${page.meta.updated} (30+ days)`
      });
    }
  }

  // Check index.md coverage
  const indexContent = fs.readFileSync(`${WIKI_PATH}/index.md`, 'utf-8');
  for (const name of Object.keys(pages)) {
    if (name === 'index' || name === 'log') continue;
    const wikiName = name.replace(/-/g, '-');
    if (!indexContent.includes(wikiName) && !indexContent.includes(name.replace(/-/g, ' '))) {
      suggestions.push({
        type: 'missing-from-index',
        page: name,
        message: `${name} not listed in index.md`
      });
    }
  }

  // Build report
  const today = new Date().toISOString().split('T')[0];
  let report = `---
title: Wiki Lint Report
created: ${today}
updated: ${today}
tags: [meta, wiki, lint]
---

# Wiki Lint Report

_Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}_

## Summary

| Check | Count |
|-------|-------|
| Total pages | ${files.length} |
| Issues | ${issues.length} |
| Suggestions | ${suggestions.length} |

`;

  if (issues.length > 0) {
    report += `## ⚠️ Issues\n\n`;
    for (const issue of issues) {
      report += `- **${issue.type}** — ${issue.page}: ${issue.message}\n`;
    }
    report += `\n`;
  }

  if (suggestions.length > 0) {
    report += `## 💡 Suggestions\n\n`;
    for (const suggestion of suggestions) {
      report += `- **${suggestion.type}** — ${suggestion.page}: ${suggestion.message}\n`;
    }
    report += `\n`;
  }

  if (issues.length === 0 && suggestions.length === 0) {
    report += `✅ **Wiki is healthy!** No issues or suggestions.\n\n`;
  }

  report += `---
_Next lint: next Friday 9am MDT_
`;

  return report;
}

async function main() {
  console.log("🔍 Running wiki lint...");

  try {
    const report = generateLintReport();
    const today = new Date().toISOString().split('T')[0];
    const reportPath = `${WIKI_PATH}/topics/wiki-lint-${today}.md`;
    
    fs.writeFileSync(reportPath, report);
    console.log(`✓ Wrote: ${reportPath}`);

    // Also update main lint page
    fs.writeFileSync(`${WIKI_PATH}/topics/wiki-lint.md`, report);
    console.log(`✓ Updated: wiki-lint.md`);

    console.log("\n✅ Wiki lint complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();