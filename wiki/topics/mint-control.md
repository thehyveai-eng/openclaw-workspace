---
title: Mint Control
created: 2026-05-30
updated: 2026-05-30
tags: [topic, project, mint, dashboard]
---

# Mint Control

## Overview

Localhost Mission Control dashboard for Mint Window Cleaning operations. Built 2026-05-30 as a Next.js application to make the invisible visible — what MiNTY is working on, what's been learned, what's scheduled, what's been found.

## Screens

1. **Tasks** — Backlog / in-progress / done (what MiNTY is actually working on)
2. **Memory** — Daily logs and long-term memory (journal-style, searchable)
3. **Calendar** — Cron jobs and scheduled tasks with next-run times
4. **Team** — Org structure, mission statement, herb crew roster

## Tech Stack

- Next.js (App Router) + Tailwind + shadcn/ui
- Dark navy (`#0a0f1a`) base, mint green (`#3ecf8e`) accents
- Runs on localhost (`http://localhost:3000`)
- Reads/writes to OpenClaw workspace

## Integrations

| Service | Status | Data |
|---------|--------|------|
| HubSpot | ✅ Connected | Deals, pipelines, contacts |
| Aircall | ✅ Connected | Users, calls, phone numbers |
| Housecall Pro | ❌ Pending | Needs OAuth setup (client-id/secret) |

## Agent Crew (Herb Theme)

- **MiNTY** 🌱 — Chief of Staff (current)
- **SAGE** — Sales Intelligence (planned)
- **BASIL** — Ops & HR (planned)
- **CLOVER** — Customer Service (planned)
- **SPRIG** — Research (planned)

## Design

- Dark navy + mint green (`#3ecf8e`)
- Pixel-art mint leaf mascot for MiNTY
- Clean sans-serif typography
- Sidebar with active indicator ("MiNTY ONLINE")

## Status

- Built: 2026-05-30
- Repo: `~/mint-control/` (not yet pushed to GitHub)
- Running at: `http://localhost:3000`

---

_Related: [[mint-window-cleaning]], [[openclaw]], [[hubspot]]_