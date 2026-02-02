# Molt Swarm Evolution Plan - Phase 2

## Goal
Enhance Claw Mountain with health monitoring and fleet backup/restore capabilities for the commander to maintain their swarm effectively.

**Status:** Phase 1 & 2 **COMPLETE** ✓ (CLI and Dashboard integration)

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

### Implementation Status: ✅ COMPLETE

#### 1. ✅ New Script: `.scripts/_molt/health-watch`
- **Purpose:** Check if molt is alive, update state, send alerts
- **Pattern:** Similar to `.scripts/_molt/_mail/watch`
- **ParseArger flags:** 
  - `--alert-email` (optional)
  - `--consecutive-failures` (default: 2 before alerting)
  - `--verbose`

**State Management:**
Create `.molt-state/` directory in molt home:
```
<molt-name>/
└── .molt-state/
    ├── health-status.json    # Current status: last_check, status, pid
    ├── health-history.jsonl  # Append-only: timestamp, status, response_time
    └── health-watch-state.json  # Consecutive failures, last success, alert sent
```

**Alert Logic:**
- ✅ Only send alert after N consecutive failures (default 2)
- ✅ Use existing mail infrastructure (msmtp) 
- ✅ Alert includes: molt name, status, timestamp

#### 2. ✅ New Script: `.scripts/_molt/_health/setup`
- **Purpose:** Setup/remove health monitoring cron
- **ParseArger flags:**
  - `--interval` (minutes, default: 5)
  - `--offset` (minute offset for staggered checks)
  - `--remove` (remove monitoring)
  - `--status` (show current status)
  - `--alert-email` (where to send alerts)
  - `--consecutive-failures` (threshold before alerting)

**Cron expression**:
```bash
# MOLT-HEALTH-WATCH - Health check every ${INTERVAL}min (offset: ${OFFSET})
*/${INTERVAL} * * * * /path/to/health-watch <molt-name> >> /path/to/cron.log 2>&1
```

#### 3. ✅ New Command: `clmnt molt health <name>`
- ✅ Registered in `.scripts/molt` as subcommand
- **Subcommands:**
  - ✅ `check` - Manual health check (one-time)
  - ✅ `setup` - Configure monitoring
  - ✅ `status` - Show current health status
  - ✅ `history` - Show uptime history
  - ✅ `logs` - View health check logs

#### 4. ✅ New Scripts in `.scripts/_molt/_health/`:
- ✅ `check` - Single health check
- ✅ `setup` - Cron setup (wraps setup script)
- ✅ `status` - Read and display health status
- ✅ `history` - Parse history and show uptime stats
- ✅ `logs` - Tail health check logs

#### 5. ✅ Dashboard Integration:
- **Server endpoints added to `.dashboard/server/src/index.ts`:**
  - `GET /api/molts/:name/health` - Returns current health status
  - `GET /api/molts/:name/history` - Returns historical uptime data
  - `GET /api/molts/:name/watch-state` - Returns watch state (failures, alerts)
- **Client components:**
  - `HealthPanel` component displays health badges (healthy/unhealthy/dead)
  - Shows current status, PID, port, response time
  - Shows consecutive failures and last success time
  - Uptime percentage with visual bar chart
  - History timeline with colored dots
  - "Setup Health Monitoring" button for unmoltored molts

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

### Implementation Status: ✅ COMPLETE

#### 1. ✅ New Script: `.scripts/_fleet/backup`
- **Purpose:** Backup all molts to a single archive
- **Location:** `.scripts/_fleet/`
- **ParseArger flags:**
  - `--output` (backup file path, default: `./.backups/fleet-YYYY-MM-DD.tar.gz`)
  - `--exclude-maildir` (optional, exclude Maildir to save space)
  - `--exclude-logs` (optional, exclude log files)
  - `--compress` (compression level: gzip|bzip2|xz)

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
│   ├── .mail-state/       # Mail state
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

#### 2. ✅ New Script: `.scripts/_fleet/restore`
- **Purpose:** Restore fleet from backup archive
- **ParseArger flags:**
  - `--from` (backup file path, required)
  - `--select` (restore specific molts, default: all)
  - `--force` (overwrite existing molts)
  - `--dry-run` (show what would be restored)
  - `--skip-users` (restore configs only, don't create users)

**Restore Logic:**
1. ✅ Extract manifest.json
2. ✅ Show user what will be restored (molt names, sizes)
3. ✅ For each molt:
   - ✅ Check if molt already exists (fail unless --force)
   - ✅ Create user if doesn't exist (unless --skip-users)
   - ✅ Restore all config files
   - ✅ Restore skills directory
   - ✅ Restore mail configs
   - ✅ Optional: restore Maildir
4. ✅ Update `.molt-info` with restored timestamp

#### 3. ✅ New Script: `.scripts/_fleet/list-backups`
- **Purpose:** List available backups in ./.backups/
- **ParseArger flags:**
  - `--backup-dir` (directory containing backups, default: `./.backups`)
  - `--json` (output in JSON format)
- Shows: date, size, number of molts, hostname

#### 4. ✅ New Command: `clmnt fleet <action>`
- ✅ Registered in `clmnt` as top-level command
- **Subcommands:**
  - ✅ `backup` - Create fleet backup
  - ✅ `restore` - Restore from backup
  - ✅ `list-backups` - Show available backups

**Registration:**
```bash
# In clmnt:
# @parseArger pos command "Command to run" --subcommand-directory ".scripts" --one-of "molt" --one-of "fleet"
```

---

## Implementation Order

### Phase 1: Health Monitoring ✅ COMPLETE
- [x] Create `.scripts/_molt/_health/` directory
- [x] Implement `health-watch` (core monitoring script)
- [x] Implement `_health/check` (manual check)
- [x] Implement `_health/setup` (cron setup)
- [x] Implement `_health/status` (read state files)
- [x] Implement `_health/history` (parse history)
- [x] Implement `_health/logs` (view logs)
- [x] Register `health` subcommand in `.scripts/molt`
- [x] Register `molt` in `clmnt` (already done)
- [x] Update dashboard server with health endpoints
- [x] Update dashboard client with health UI

### Phase 2: Fleet Backup/Restore ✅ COMPLETE
- [x] Create `.scripts/_fleet/` directory
- [x] Implement `_fleet/backup`
- [x] Implement `_fleet/restore`
- [x] Implement `_fleet/list-backups`
- [x] Create `.scripts/fleet` parent command
- [x] Register `fleet` in `clmnt`
- [x] Create `.backups/` directory in .gitignore

---

## CLI Usage Reference

### Health Monitoring

```bash
# Setup monitoring for a molt
./clmnt molt health setup <name> [--interval 5] [--alert-email user@example.com]

# Check status manually
./clmnt molt health check <name> [--json]

# View current health status
./clmnt molt health status <name> [--json]

# View uptime history
./clmnt molt health history <name> [--limit 20] [--json]

# View/tail health check logs
./clmnt molt health logs <name> [--follow] [--lines 50]

# Remove monitoring
./clmnt molt health setup <name> --remove
```

### Fleet Backup/Restore

```bash
# Create backup (auto-creates ./.backups/ if needed)
./clmnt fleet backup [--output ./.backups/custom.tar.gz] [--exclude-maildir]

# List available backups
./clmnt fleet list-backups [--json]

# Restore from backup (dry-run first recommended)
./clmnt fleet restore --from ./.backups/fleet-2026-02-02.tar.gz [--dry-run]

# Restore specific molts only
./clmnt fleet restore --from backup.tar.gz --select molt1,molt2

# Force overwrite existing molts
./clmnt fleet restore --from backup.tar.gz --force
```

---

## Success Criteria

- [x] `clmnt molt health setup mybot` creates cron job monitoring mybot every 5 minutes
- [x] `clmnt molt health status mybot` shows current health (healthy/unhealthy/dead)
- [x] `clmnt molt health history mybot` shows uptime stats and recent checks
- [x] Email alerts sent when molt fails health check N times consecutively
- [x] `clmnt fleet backup` creates tar.gz with all molt configs
- [x] `clmnt fleet list-backups` shows available backups
- [x] `clmnt fleet restore --from backup.tar.gz` restores all molts
- [x] Dashboard shows health indicators on molt cards (healthy/unhealthy/dead badges)
- [x] Dashboard displays health details panel (PID, port, response time, failures)
- [x] Dashboard shows uptime history with visual chart

---

## Key Code References

**Implemented Scripts:**
- `.scripts/_molt/health` - Parent routing script
- `.scripts/_molt/health-watch` - Core monitoring via cron
- `.scripts/_molt/_health/check|setup|status|history|logs` - Subcommands
- `.scripts/fleet` - Parent routing script  
- `.scripts/_fleet/backup|restore|list-backups` - Fleet subcommands
- `clmnt` - Main CLI entrypoint (updated with fleet and molt health)

**For parseArger patterns:**
- `.scripts/molt` line 14: Subcommand registration pattern
- `.scripts/_molt/_mail/cron-setup` lines 149-242: Cron setup logic
- `.scripts/_molt/status` lines 277-304: Health check logic

**State Files:**
- `<molt>/.molt-state/health-status.json` - Current health status
- `<molt>/.molt-state/health-history.jsonl` - Check history (append-only)
- `<molt>/.molt-state/health-watch-state.json` - Watch state (failures, alerts)

**Backup Storage:**
- `./.backups/` - Hidden directory for fleet backups (gitignored)

---

## Notes

**Architecture Decisions:**
1. Used cron jobs instead of systemd timers for simplicity and portability
2. Staggered health checks using molt port-based offsets to avoid thundering herd
3. Hidden `.backups` directory instead of visible `backups/` for cleaner workspace
4. All parseArger-generated scripts follow the pattern with `--subcommand-directory` for routing

**Files Modified:**
- `clmnt` - Added `fleet` to available commands
- `.scripts/molt` - Added `health` to available actions
- `.gitignore` - Added `.backups/`

**New Directories:**
- `.scripts/_molt/_health/` - Health monitoring subcommands
- `.scripts/_fleet/` - Fleet management scripts
- `.backups/` - Backup storage (created on first backup, gitignored)

**Potential Future Enhancements:**
- WebSocket real-time health updates
- Health alert notifications in dashboard
- Fleet-wide health status overview
