# WIKI.md — MiNTY's Wiki Schema

## Overview

This wiki is a persistent, compounding knowledge base. It sits between raw sources and answers — compiled once, kept current, not re-derived on every query.

**Three layers:**
- `raw/` — immutable source documents (articles, notes, transcripts)
- `wiki/` — LLM-generated markdown pages (summaries, entities, concepts)
- `WIKI.md` (this file) — schema and conventions

## Core Principle

> The wiki is a persistent, compounding artifact. Cross-references are already there. Contradictions are flagged. Synthesis reflects everything seen. The wiki gets richer with every source and every question.

You (Caleb) are in charge of sourcing and asking questions. I (MiNTY) do all the grunt work: summarizing, cross-referencing, filing, and bookkeeping.

## Directory Structure

```
wiki/
├── WIKI.md           ← this file (schema)
├── index.md          ← catalog of all wiki pages
├── log.md            ← chronological append-only record
├── entities/         ← people, companies, organizations
│   ├── caleb-gubler.md
│   ├── mint-window-cleaning.md
│   ├── citrus-carpet-cleaning.md
│   ├── mint-movement.md
│   ├── aircall.md
│   └── hubspot.md
├── topics/           ← concepts, projects, systems
│   ├── mint-control.md
│   ├── openclaw.md
│   └── llm-wiki.md
└── sources/          ← summaries of ingested materials
    └── 2026-05-30-initial-memory.md
```

## Conventions

### Naming
- Files: lowercase-with-hyphens.md (e.g., `mint-window-cleaning.md`)
- Internal links: `[[page-name]]` (Obsidian-style)
- External links: `[label](url)`

### Timestamps
- ISO format: `YYYY-MM-DD`
- Logs entries: `## [YYYY-MM-DD] ingest | Title`

### Frontmatter
Every wiki page starts with:

```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [entity, business, mint]
---

Content...
```

## Workflows

### Ingest (Adding a Source)

1. Drop source in `raw/` directory
2. Tell me to ingest it
3. I will:
   - Read the source
   - Write a summary in `wiki/sources/YYYY-MM-DD-source-slug.md`
   - Update `wiki/index.md`
   - Update relevant entity/concept pages
   - Append entry to `wiki/log.md`

### Query (Answering a Question)

1. You ask a question
2. I search `wiki/index.md` for relevant pages
3. I read those pages
4. I synthesize an answer with citations
5. If answer is valuable, I file it as a new wiki page

### Lint (Health Check)

Periodically (weekly), I will:
- Check for contradictions between pages
- Flag stale claims superseded by new data
- Find orphan pages (no inbound links)
- Note concepts lacking their own pages
- Suggest missing cross-references
- Identify data gaps

Run lint by asking: "Run wiki lint"

## Special Files

### index.md

Catalog of every wiki page. Updated on every ingest.

Format:
```markdown
## Entities
- [[caleb-gubler]] — Founder of Mint Window Cleaning
- [[mint-window-cleaning]] — Multi-market home service company

## Topics
- [[mint-control]] — Mission control dashboard for Mint ops

## Sources
- [[2026-05-30-initial-memory]] — Initial memory dump from first session
```

### log.md

Append-only chronological record.

Format:
```markdown
## [2026-05-30] ingest | Initial memory dump
- Entities: Caleb, Mint Window Cleaning, Citrus Carpet Cleaning, Mint Movement
- Topics: OpenClaw setup, HubSpot connection, MINT CONTROL build

## [2026-05-30] query | How to enable Dreaming mode
- Answer filed to: [[openclaw-dreaming]]

## [2026-05-30] lint | Weekly health check
- All pages current, no contradictions found
```

## First Ingest (2026-05-30)

Initial memory from first session with Caleb:

- **Caleb Gubler**: 27yo entrepreneur, Utah→Florida relocation soon. Systems thinker, long-game focus.
- **Mint Window Cleaning**: Co-founder/m minority owner. Multi-market home service company.
- **Citrus Carpet Cleaning**: Major owner/operator. Carpet, tile, upholstery, stone cleaning.
- **Mint Movement**: Coaching/community for home service entrepreneurs.
- **Tools**: HubSpot, Housecall Pro, Aircall, Connecteam, ClickUp
- **Goals**: Eight-figure businesses → acquisition platforms. Financial freedom. Geographic flexibility.
- **Personal**: Married to Pamela (Brazilian, Portuguese together). Surfing, outdoor activities.
- **Today**: Set up OpenClaw, connected GitHub, built MINT CONTROL dashboard, wired HubSpot + Aircall APIs

---

_This schema co-evolves with Caleb as we figure out what works. Update this file when patterns change._