# OpenClaw Cron Jobs & Scheduling

**Source:** `docs.openclaw.ai/cron-jobs`

## Overview
Cron is OpenClaw's built-in scheduler. It runs locally on the Gateway host.
- **Storage:** `~/.openclaw/cron/jobs.json` (In-memory, rewritten on change).
- **History:** `~/.openclaw/cron/runs/<jobId>.jsonl`.
- **Management:** Use `openclaw cron` CLI or tool calls. Avoid manual edits while Gateway is running.

## Execution Models

### 1. Main Session (System Event)
- **Use Case:** Regular heartbeat prompts, context-aware reminders.
- **Behavior:** Enqueues a system event; runs on next heartbeat.
- **Context:** Shares full history of the main agent session.

### 2. Isolated Session (Background Task)
- **Use Case:** Periodic summaries, checking emails, background processing.
- **Behavior:** Spawns a fresh session (`cron:<jobId>`).
- **Context:** No prior history. Prompt prefixed for traceability.
- **Output:** Can optionally post a summary back to the main chat (`postToMainMode: "summary"`).

## Payload Examples

### One-Shot System Event (Main Session)
```json
{
  "name": "Reminder",
  "schedule": { "kind": "at", "atMs": 1738262400000 },
  "sessionTarget": "main",
  "wakeMode": "now",
  "payload": {
    "kind": "systemEvent",
    "text": "Reminder text"
  },
  "deleteAfterRun": true
}
```

### Recurring Isolated Task
```json
{
  "name": "Morning Brief",
  "schedule": {
    "kind": "cron",
    "expr": "0 7 * * *",
    "tz": "America/Los_Angeles"
  },
  "sessionTarget": "isolated",
  "wakeMode": "next-heartbeat",
  "payload": {
    "kind": "agentTurn",
    "message": "Check for new files in dropzone.",
    "deliver": true,
    "channel": "slack",
    "to": "channel:C1234567890"
  },
  "isolation": {
    "postToMainPrefix": "Dropzone Scanner",
    "postToMainMode": "summary"
  }
}
```

## Configuration
- **Enable/Disable:** `cron.enabled` in `openclaw.json` or `OPENCLAW_SKIP_CRON=1`.
- **Concurrency:** `maxConcurrentRuns` (default: 1).
