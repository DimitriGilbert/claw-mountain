# OpenClaw Configuration

**Source:** `docs.openclaw.ai/configuration`

## Overview
Configuration is strictly typed and validated.
- **Path:** `~/.openclaw/openclaw.json`
- **Format:** JSON5 (allows comments, trailing commas).
- **Env Vars:** Can be used in values via `${VAR_NAME}`.

## Gateway Configuration
The `gateway` section controls the HTTP/WebSocket server.

```json
{
  "gateway": {
    "port": 18789,      // Default port
    "bind": "loopback", // "loopback" (localhost) or "lan" (0.0.0.0)
    "auth": {
      "token": "secret-token-here"
    },
    "reload": true      // Allow config hot-reloading
  }
}
```

## Agent Configuration
Defines the identity and behavior of agents running on this gateway.

```json
{
  "agents": {
    "defaults": {
      "model": "anthropic/claude-3-5-sonnet",
      "workspace": "./workspace"
    },
    "list": [
      {
        "id": "main",
        "name": "Commander",
        "sandbox": { "mode": "docker" }
      },
      {
        "id": "coder",
        "name": "Code Specialist",
        "model": "openrouter/deepseek-coder"
      }
    ]
  }
}
```

## Hooks
Internal event triggers (not to be confused with external Webhooks).

```json
{
  "hooks": {
    "enabled": true,
    "directories": ["./my-hooks"]
  }
}
```
