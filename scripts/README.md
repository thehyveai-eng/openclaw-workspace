# Scripts Directory

Stabilized workflows — converted from fragile LLM prompt chains to hard-coded scripts that run reliably via cron.

## Why This Directory?

Tina's "build and stabilize" loop: use the agent to build workflows, test until proven, then convert to stable code so they don't degrade over time.

## Scripts

### hubspot-weekly-summary.js

**Purpose:** Fetches current HubSpot pipeline state and writes summary to wiki.  
**Schedule:** Monday 9am MDT (`0 9 * * 1`)  
**Output:** `wiki/topics/hubspot-weekly-YYYY-MM-DD.md` + `wiki/topics/hubspot.md`  
**Requires:** `HUBSPOT_TOKEN` env var

### wiki-lint.js

**Purpose:** Health-checks the wiki for orphans, stale pages, missing cross-references, index gaps.  
**Schedule:** Friday 9am MDT (`0 9 * * 5`)  
**Output:** `wiki/topics/wiki-lint-YYYY-MM-DD.md` + `wiki/topics/wiki-lint.md`  
**Requires:** Wiki directory exists

## Adding New Scripts

1. Create the script in this directory
2. Make it executable: `chmod +x scripts/script-name.js`
3. Add a cron job via `cron add`
4. Document in this README

## Running Manually

```bash
# Run HubSpot summary
node scripts/hubspot-weekly-summary.js

# Run wiki lint
node scripts/wiki-lint.js

# Check cron status
openclaw gateway call cron.list
```

---

_Scripts are stable, deterministic code. The agent (MiNTY) handles cognitive tasks; these scripts handle reliable execution._