# OpenClaw Docker Deployment

**Source:** `docs.openclaw.ai/docker`

## Overview
Docker is the recommended way to run OpenClaw for isolation and security, especially when using the Sandbox feature.

## Environment Variables
The `docker-setup.sh` script and container runtime support these variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `OPENCLAW_DOCKER_APT_PACKAGES` | Install extra system packages on build | `ffmpeg build-essential` |
| `OPENCLAW_EXTRA_MOUNTS` | Bind mount host paths | `$HOME/code:/home/node/code:rw` |
| `OPENCLAW_HOME_VOLUME` | Persist `/home/node` | `openclaw_home` |

## Volume Mounts
- **Home:** `/home/node` - Stores configuration (`.openclaw/`) and state.
- **Workspace:** `/workspace` - Mounted for agent sandboxing.

## Networking
- **Port:** Defaults to `18789`.
- **Binding:** Defaults to `lan` (0.0.0.0) inside the container to be accessible from the host.

## Sandbox Mode
When running agents in Docker mode, OpenClaw spins up sibling containers for executing unsafe code (Python/Bash) to prevent damaging the main gateway container.
