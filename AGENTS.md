# AGENTS.md

This is a collection of bash scripts for managing isolated OpenClaw bot instances (molts) with dedicated users, home directories, and configurations.

## Architecture

Each molt is a Linux user with:
- Isolated home directory in `molts/<name>/`
- Dedicated OpenClaw configuration and state
- Auto-assigned unique port (19001, 19021, 19041...)
- Docker group membership for sandboxing
- No sudo access for security

## Tooling

- **Argument parsing**: All scripts use [parseArger](https://github.com/BunnySweety/parseArger) for robust CLI handling
- **Base directory**: Default is `/home/didi/molts` (configurable with `-d` flag)
- **Logs**: Stored in `molts/<name>/.openclaw/gateway.log`

## Script Organization

All management scripts live in `.scripts/`:

**Core Lifecycle:**
- `create-molt` - Create new molt with user, config, and directory structure
- `molt-start` - Start OpenClaw gateway for a molt
- `molt-stop` - Stop running gateway (graceful with `--force` option)
- `molt-delete` - Complete removal (user, home, processes)

**Monitoring & Access:**
- `molt-list` - Show all molts with status
- `molt-status` - Detailed status for specific molt
- `molt-logs` - View/tail gateway logs (`-f` for follow mode)
- `molt-dashboard` - Get dashboard URL (auto-detects server IP)

**Development Tools:**
- `molt-shell` - Interactive shell as molt user
- `molt-exec` - Execute commands as molt user
- `molt-browser` - Launch browser with isolated profile per molt
- `molt-clone` - Copy configuration from existing molt to new one

## Common Workflows

**Create and start a new molt:**
```bash
./.scripts/create-molt my-bot
sudo -u my-bot openclaw onboard
./.scripts/molt-start my-bot
```

**Check status and logs:**
```bash
./.scripts/molt-list
./.scripts/molt-logs my-bot -f
```

**Browser automation setup:**
```bash
./.scripts/molt-browser my-bot -b chrome -u https://gmail.com
```

## Configuration

Molt configs are stored in `molts/<name>/.openclaw/openclaw.json`:
- Port assignment in `gateway.port`
- Workspace path in `agents.defaults.workspace`
- Environment variables in `.openclaw/.env`

## Progressive Disclosure

- **Script reference**: See README.md for full command documentation
- **OpenClaw configuration**: See [OpenClaw docs](https://docs.openclaw.ai/)
- **parseArger usage**: Each script has declarations at the top showing available options

## Privacy Note

The `molts/` directory is gitignored. Each deployment's bot instances remain personal and uncommitted.
