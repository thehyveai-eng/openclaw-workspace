# wiki/log.md — MiNTY's Wiki Timeline

_Append-only record of wiki evolution. Format: ## [YYYY-MM-DD] entry-type | Title_

---

## [2026-05-30] setup | Wiki foundation created

- Created wiki directory structure: `entities/`, `topics/`, `sources/`, `raw/`
- Created `WIKI.md` schema (conventions, workflows, directory structure)
- Created `index.md` catalog
- Created this `log.md` timeline
- First ingest: initial memory from setup session

## [2026-05-30] ingest | Initial memory dump

**Entities created:**
- [[caleb-gubler]] — 27yo founder, Utah→Florida, systems thinker
- [[mint-window-cleaning]] — Co-founder/m minor owner, multi-market
- [[citrus-carpet-cleaning]] — Major owner/operator, carpet/tile/upholstery/stone
- [[mint-movement]] — Coaching community for home service entrepreneurs

**Topics created:**
- [[mint-control]] — Dashboard built during first session
- [[openclaw]] — Gateway setup and security hardening
- [[llm-wiki]] — Knowledge base pattern from Karpathy

**Systems connected:**
- HubSpot API (token stored in `~/.zshrc`)
- Aircall API (credentials stored in `~/.zshrc`)
- Housecall Pro (needs OAuth, pending)
- GitHub repo: `thehyveai-eng/openclaw-workspace`

**Key decisions:**
- MINT CONTROL: Next.js + Tailwind + shadcn/ui, dark navy + mint green
- Security: `allowInsecureAuth` disabled, `dangerouslyDisableDeviceAuth` still active (localhost-only)
- Memory: Dreaming mode enabled for background consolidation

---

_This log grows. Entries start with `## [DATE]` for easy parsing with `grep "^## \[" log.md`_