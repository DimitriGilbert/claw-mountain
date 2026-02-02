# Molt Swarm Evolution Plan - Phase 2

## Goal
Enhance Claw Mountain with health monitoring and fleet backup/restore capabilities for the commander to maintain their swarm effectively.

---

## Feature 1: Health Monitoring with Heartbeats

### Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  systemd timer  │────▶│  health-watch    │────▶│  alert if dead  │
│  (or cron job)  │     │  (per molt)      │     │  (via msmtp)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│ state file:     │     │ history file:    │
│ .molt-state/    │     │ .molt-state/     │
│ health-status   │     │ health-history   │
└─────────────────┘     └──────────────────┘
```

### Components to Create

#### 1. New Script: `.scripts/_molt/health-watch`
- **Purpose:** Check if molt is alive, update state, send alerts
- **Pattern:** Similar to `.scripts/_molt/_mail/watch`
- **ParseArger flags:** 
  - `--alert-email` (optional, defaults to molt's configured email)
  - `--consecutive-failures` (default: 2 before alerting)
  - `--verbose`

**State Management:**
Create `.molt-state/` directory in molt home:
```
<molt-name>/
└── .molt-state/
    ├── health-status.json    # Current status: last_check, status, pid
    └── health-history.jsonl  # Append-only: timestamp, status, response_time
```

**Health Check Logic (similar to status script lines 277-304):**
```bash
# Check PID file exists and process is running
PID_FILE="$MOLT_HOME/.openclaw/gateway.pid"
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    # Try HTTP health check to gateway
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$MOLT_PORT/health" 2>/dev/null || echo "000")
    if [ "$HEALTH" = "200" ]; then
      STATUS="healthy"
    else
      STATUS="unhealthy"
    fi
  else
    STATUS="dead"
  fi
else
  STATUS="unknown"
fi
```

**Alert Logic:**
- Only send alert after N consecutive failures (default 2)
- Use existing mail infrastructure (msmtp) similar to `.scripts/_molt/_mail/watch`
- Alert includes: molt name, status, timestamp, last successful check
- Send isolated session webhook to commander molt (if configured)

#### 2. New Script: `.scripts/_molt/health-setup`
- **Purpose:** Setup/remove health monitoring cron/systemd timer
- **Pattern:** Similar to `.scripts/_molt/_mail/cron-setup`
- **ParseArger flags:**
  - `--interval` (minutes, default: 5)
  - `--remove` (remove monitoring)
  - `--status` (show current status)
  - `--alert-email` (where to send alerts)

**Cron expression** (similar to mail cron-setup):
```bash
# MOLT-HEALTH-WATCH - Health check every ${INTERVAL}min
*/5 * * * * /path/to/health-watch <molt-name> --alert-email commander@example.com >> /path/to/health.log 2>&1
```

#### 3. New Command: `clmnt molt health <name>`
- Register in `.scripts/molt` (like `mail` subcommand)
- **Subcommands:**
  - `check` - Manual health check (one-time)
  - `setup` - Configure monitoring
  - `status` - Show current health status
  - `history` - Show uptime history
  - `logs` - View health check logs

#### 4. New Scripts in `.scripts/_molt/_health/`:
- `check` - Single health check (similar to `.scripts/_molt/_mail/check`)
- `setup` - Cron/systemd timer setup (similar to `.scripts/_molt/_mail/cron-setup`)
- `status` - Read and display `.molt-state/health-status.json`
- `history` - Parse `.molt-state/health-history.jsonl` and show uptime stats
- `logs` - Tail health check logs

#### 5. Dashboard Integration:
Add to `.dashboard/server/src/index.ts`:
- `GET /api/molts/:name/health` - Return health status
- `GET /api/molts/:name/history` - Return historical data
- Display health indicators in React client (red/green status badges)

---

## Feature 2: Fleet Backup/Restore

### Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  clmnt fleet    │────▶│  backup          │────▶│  backup-YYYY    │
│  backup         │     │  (all molts)     │     │  -MM-DD.tar.gz  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│ For each molt:  │     │ Bundle includes: │
│ - openclaw.json │     │ - All configs    │
│ - .molt-info    │     │ - Skills         │
│ - skills/       │     │ - Mail configs   │
│ - .msmtprc      │     │ - State files    │
│ - .mbsyncrc     │     │ - Metadata       │
│ - Maildir/      │     │                  │
│ - .molt-state/  │     │                  │
└─────────────────┘     └──────────────────┘
```

### Components to Create

#### 1. New Script: `.scripts/_fleet/backup`
- **Purpose:** Backup all molts to a single archive
- **Location:** `.scripts/_fleet/` (new directory, sibling to `_molt/`)
- **ParseArger flags:**
  - `--output` (backup file path, default: ./backups/fleet-YYYY-MM-DD.tar.gz)
  - `--exclude-maildir` (optional, exclude Maildir to save space)
  - `--exclude-logs` (optional, exclude log files)
  - `--compress` (compression level, default: gzip)

**Backup Contents Per Molt:**
```
backup/
├── manifest.json           # List of molts, versions, timestamp
├── <molt-name>/
│   ├── openclaw.json      # Config
│   ├── .molt-info         # Metadata
│   ├── .env               # Environment
│   ├── skills/            # Custom skills
│   ├── .msmtprc          # SMTP config
│   ├── .mbsyncrc         # IMAP config
│   ├── .molt-state/       # Health monitoring state
│   └── Maildir/          # Optional (large)
└── global/
    └── (any global config)
```

**Manifest Format:**
```json
{
  "version": "1.0",
  "timestamp": "2026-02-02T10:30:00Z",
  "hostname": "claw-mountain",
  "molts": [
    {
      "name": "assistant-1",
      "port": 19001,
      "created": "2026-01-15",
      "backup_size_bytes": 1234567
    }
  ],
  "total_size_bytes": 9876543
}
```

#### 2. New Script: `.scripts/_fleet/restore`
- **Purpose:** Restore fleet from backup archive
- **ParseArger flags:**
  - `--from` (backup file path, required)
  - `--select` (restore specific molts, default: all)
  - `--force` (overwrite existing molts)
  - `--dry-run` (show what would be restored)
  - `--skip-users` (restore configs only, don't create users)

**Restore Logic:**
1. Extract manifest.json
2. Show user what will be restored (molt names, sizes)
3. For each molt:
   - Check if molt already exists (fail unless --force)
   - Create user if doesn't exist (unless --skip-users)
   - Restore all config files
   - Restore skills directory
   - Restore mail configs
   - Optional: restore Maildir
4. Update `.molt-info` with restored timestamp

#### 3. New Script: `.scripts/_fleet/list-backups`
- **Purpose:** List available backups in ./backups/
- Shows: date, size, number of molts, hostname

#### 4. New Command: `clmnt fleet <action>`
- Register in `.scripts/` as new top-level command (like `molt`)
- **Subcommands:**
  - `backup` - Create fleet backup
  - `restore` - Restore from backup
  - `list-backups` - Show available backups

**Registration in `.scripts/fleet`:**
```bash
# Similar to .scripts/molt line 14:
# @parseArger pos action "Fleet action" --subcommand-run --subcommand-use-leftovers --subcommand --one-of "backup" --one-of "restore" --one-of "list-backups"
```

---

## Implementation Order

### Phase 1: Health Monitoring
1. Create `.scripts/_molt/_health/` directory
2. Implement `health-watch` (core monitoring script)
3. Implement `_health/check` (manual check)
4. Implement `_health/setup` (cron/timer setup)
5. Implement `_health/status` (read state files)
6. Implement `_health/history` (parse history)
7. Register `health` subcommand in `.scripts/molt`
8. Update dashboard server with health endpoints
9. Update dashboard client with health UI

### Phase 2: Fleet Backup/Restore
1. Create `.scripts/_fleet/` directory
2. Implement `_fleet/backup`
3. Implement `_fleet/restore`
4. Implement `_fleet/list-backups`
5. Create `.scripts/fleet` parent command
6. Create backups/ directory in .gitignore

---

## Key Code References

**For parseArger patterns:**
- `.scripts/molt` line 14: Subcommand registration pattern
- `.scripts/_molt/_mail/cron-setup` lines 149-242: Cron setup logic
- `.scripts/_molt/status` lines 277-304: Health check logic

**For file structure:**
- `.scripts/_molt/create` lines 340-450: Molt directory creation
- `.scripts/_molt/list`: JSON output format (for health history)

**For mail alerts:**
- `.scripts/_molt/_mail/watch`: How to send msmtp alerts
- `.docs/openclaw/hooks_and_webhooks.md`: Webhook format for isolated sessions

**For dashboard integration:**
- `.dashboard/server/src/index.ts`: API endpoint patterns
- `.dashboard/client/src/App.tsx`: React component patterns

---

## Success Criteria

- [ ] `clmnt molt health setup mybot` creates cron job monitoring mybot every 5 minutes
- [ ] `clmnt molt health status mybot` shows current health (healthy/unhealthy/dead)
- [ ] `clmnt molt health history mybot` shows uptime stats and recent checks
- [ ] Email alerts sent when molt fails health check N times consecutively
- [ ] `clmnt fleet backup` creates tar.gz with all molt configs
- [ ] `clmnt fleet list-backups` shows available backups
- [ ] `clmnt fleet restore --from backup.tar.gz` restores all molts
- [ ] Dashboard shows health indicators on molt cards
- [ ] All scripts pass `bun run check-types` (if touching dashboard)
