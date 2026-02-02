# OpenClaw Hooks & Webhooks

**Source:** `docs.openclaw.ai/hooks` & `docs.openclaw.ai/gateway`

## Internal Hooks
Event-driven scripts running *inside* the Gateway.
- **Events:** `command:new`, `command:reset`, `agent:bootstrap`, `gateway:startup`.
- **Location:** `~/.openclaw/hooks/` or workspace `hooks/`.
- **Management:** `openclaw hooks list`, `enable`, `disable`.

## Webhook Ingress
External triggers that allow systems to wake up agents or start isolated runs.
- **Endpoint:** `POST /hooks/agent` (Derived from Gateway API patterns).
- **Auth:** Requires `Authorization: Bearer <gateway-token>`.

### Payload Structure (Inferred from Cron/Gateway Specs)
To trigger an isolated agent turn (e.g., for a Dropzone file):

```json
{
  "name": "Dropzone Trigger",
  "sessionTarget": "isolated",
  "wakeMode": "now",
  "payload": {
    "kind": "agentTurn",
    "message": "A file was dropped: /home/didi/molts/.dropzone/file.txt. Analyze it.",
    "deliver": false
  },
  "isolation": {
    "postToMainPrefix": "Dropzone",
    "postToMainMode": "summary"
  }
}
```

This structure mirrors the Cron Job payload, allowing external tools (like `curl`) to inject tasks into the agent's queue.
