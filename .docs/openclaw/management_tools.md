# OpenClaw Instance Management (Molt)

This document describes the architecture and usage of the "Molt" management scripts found in `.scripts/_molt/`. These scripts allow running multiple isolated instances of OpenClaw on a single machine.

## Architecture

Each "molt" is a fully isolated OpenClaw instance with:
- **Dedicated System User**: A unique Linux user (e.g., `mybot`) prevents file system conflicts and permission issues.
- **Isolated Home Directory**: `/home/didi/molts/<name>` (configurable base).
- **Independent Configuration**: `~/.openclaw/openclaw.json` tailored for that instance.
- **Dedicated Port**: Each instance runs its gateway on a unique port (default starting at 19001).
- **Process Isolation**: Processes run as the molt user.

## Script Reference

### Lifecycle
- **`create`**: Provisions a new molt.
  - Creates system user and home directory.
  - Generates `openclaw.json` with a unique port.
  - Installs runtime dependencies (Node.js, Bun) and default skills (`agents-md`, `task-o-matic`).
- **`start`**: Launches the OpenClaw gateway.
  - Runs `openclaw gateway` as the molt user.
  - Supports daemon mode (background process with PID tracking).
- **`stop`**: Terminates the instance.
  - Sends `SIGTERM` (graceful) or `SIGKILL` (force) to the gateway process.
- **`status`**: Checks health.
  - Verifies PID file and process existence.
  - Runs `openclaw health` to check internal state.

### Integration
- **Mail (Sidecar Pattern)**:
  - Instead of using OpenClaw's internal mail channels, a sidecar architecture is used.
  - **`msmtp`**: Handles SMTP sending.
  - **`isync` (mbsync)**: Synchronizes IMAP to local Maildir.
  - **`watch`**: A script that monitors `Maildir` for new files.
  - **Webhook**: When new mail arrives, the watcher triggers a webhook to `http://127.0.0.1:<port>/hooks/agent`, activating the OpenClaw agent to process the email using the `mail-gatekeeper` skill.

## Configuration

Configuration is generated at `~/.openclaw/openclaw.json`.
Key settings:
- `gateway.port`: Unique port for the instance.
- `gateway.bind`: Set to "loopback" for security.
- `agents.defaults.workspace`: Pointed to `~/.openclaw/workspace`.

## Requirements
- `sudo` access is required for creating users and switching contexts.
- `jq` for JSON manipulation.
- `msmtp` and `isync` for mail features.
