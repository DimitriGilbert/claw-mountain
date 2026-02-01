# Molt Management Scripts

A set of bash scripts to manage OpenClaw bot instances (molts) with isolated users, home directories, and configurations.

> **Note:** The `molts/` directory (where your actual bot instances live) is gitignored by default to keep your personal configurations private. See [Setup](#setup) below.

## Setup

1. **Clone this repository:**
   ```bash
   git clone https://github.com/DimitriGilbert/claw-mountain
   cd claw-mountain
   ```

2. **Create your molt storage directory:**
   ```bash
   mkdir molts
   ```
   
   This directory is gitignored so your personal molts won't be committed to the repo.

3. **Start using the scripts:**
   ```bash
   ./.scripts/create-molt my-first-bot
   ```

## Directory Structure

## Overview

Each molt is an isolated OpenClaw bot instance with:
- Dedicated user account (no sudo access)
- Home directory in the current folder
- Docker group membership
- Isolated OpenClaw configuration and state
- Auto-assigned unique port (starting from 19001)

## Scripts

All scripts are in `./.scripts/`:

### create-molt
Creates a new molt with user, home directory, and OpenClaw configuration.

```bash
./.scripts/create-molt <name> [options]

Options:
  -p, --port <port>     Specify gateway port (auto-assigns if not provided)
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  --skip-user           Skip user creation (if user already exists)
  -v, --verbose         Enable verbose output
```

**Example:**
```bash
# Create a new molt named "helper-bot"
./.scripts/create-molt helper-bot

# Create with specific port
./.scripts/create-molt my-bot -p 19021
```

### molt-list
Lists all molts and their status.

```bash
./.scripts/molt-list [options]

Options:
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  -v, --verbose         Show detailed information
```

### molt-status
Check the running status of a specific molt.

```bash
./.scripts/molt-status <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  -v, --verbose         Enable verbose output
```

### molt-start
Start a molt's OpenClaw gateway.

```bash
./.scripts/molt-start <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  -p, --port <port>     Override gateway port
  --daemon              Run as background daemon
  -v, --verbose         Enable verbose output
```

### molt-stop
Stop a running molt.

```bash
./.scripts/molt-stop <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  -f, --force           Force kill if graceful stop fails
  -v, --verbose         Enable verbose output
```

### molt-browser
Launch a browser as a specific molt user with isolated profile.

```bash
./.scripts/molt-browser <name> [options]

Options:
  -b, --browser <browser>  Browser to launch (firefox|chromium|chrome|brave) [default: firefox]
  -p, --profile-dir <dir>  Custom profile directory
  -u, --url <url>          URL to open
  -d, --base-dir <dir>     Base directory for molts (default: /home/didi/molts)
  --headless               Run in headless mode (no GUI)
  -v, --verbose            Enable verbose output
```

**Examples:**
```bash
# Launch Firefox as molt user (GUI mode)
./.scripts/molt-browser my-molt

# Launch Chrome and open Gmail
./.scripts/molt-browser my-molt -b chrome -u https://gmail.com

# Launch headless browser for automation
./.scripts/molt-browser my-molt -b chromium --headless
```

Each molt gets its own isolated browser profile stored in `~/.browser-profiles/<browser>/`.

## Workflow

### 1. Create a New Molt
```bash
./.scripts/create-molt my-assistant
```

This will:
- Create user `my-assistant`
- Set home directory to `/home/didi/molts/my-assistant`
- Add user to docker group
- Create OpenClaw configuration with auto-assigned port
- Create workspace and sandbox directories

### 2. Setup OpenClaw
```bash
# Run onboarding as the molt user
sudo -u my-assistant openclaw onboard
```

### 3. Start the Molt
```bash
./.scripts/molt-start my-assistant
```

### 4. Check Status
```bash
# Check specific molt
./.scripts/molt-status my-assistant

# List all molts
./.scripts/molt-list
```

### 5. Stop the Molt
```bash
./.scripts/molt-stop my-assistant
```

## Directory Structure

Each molt has the following structure:

```
/home/didi/molts/
└── <molt-name>/                    # Molt home directory
    ├── .molt-info                  # Molt metadata
    └── .openclaw/                  # OpenClaw configuration
        ├── openclaw.json           # OpenClaw config file
        ├── .env                    # Environment variables
        ├── workspace/              # Agent workspace
        ├── sandboxes/              # Sandbox directories
        └── agents/
            └── main/
                └── sessions/       # Session storage
```

## Multiple Molts

Each molt gets its own unique port starting from 19001, incrementing by 20 to avoid conflicts:
- First molt: port 19001
- Second molt: port 19021
- Third molt: port 19041
- etc.

This ensures no port conflicts between browser control, canvas host, and CDP ports.

## Security

- Each molt runs as a dedicated user with no sudo access
- Users are added to the docker group for OpenClaw sandboxing
- Home directories are isolated
- OpenClaw configurations are per-molt
- Gateway binds to loopback by default

## Requirements

- Linux system with useradd/usermod commands
- Docker group must exist (for sandboxing)
- OpenClaw must be installed and available on PATH
- Root/sudo access for user creation

## Troubleshooting

### Molt won't start
Check the gateway log:
```bash
cat /home/didi/molts/<molt-name>/.openclaw/gateway.log
```

### Permission issues
Ensure the home directory is owned by the molt user:
```bash
sudo chown -R <molt-name>:<molt-name> /home/didi/molts/<molt-name>
```

### Port already in use
Specify a different port:
```bash
./.scripts/molt-start <molt-name> -p 19501
```

### molt-logs
View or tail logs for a molt.

```bash
./.scripts/molt-logs <name> [options]

Options:
  -n, --lines <num>     Number of lines to show [default: 50]
  -f, --follow          Follow/tail logs in real-time
  -d, --base-dir <dir>  Base directory for molts
  -v, --verbose         Enable verbose output
```

### molt-shell
Open an interactive shell as a molt user.

```bash
./.scripts/molt-shell <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts
  -v, --verbose         Enable verbose output
```

### molt-delete
Completely remove a molt (user, home directory, processes).

```bash
./.scripts/molt-delete <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts
  --force               Skip confirmation prompt
  --keep-home           Keep home directory (only remove user)
  -v, --verbose         Enable verbose output
```

### molt-exec
Execute a command as a molt user.

```bash
./.scripts/molt-exec <name> <command> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts
  -v, --verbose         Enable verbose output

Example:
  ./.scripts/molt-exec my-molt "openclaw channels login"
  ./.scripts/molt-exec my-molt ls -la
```

### molt-clone
Clone an existing molt configuration to a new molt.

```bash
./.scripts/molt-clone <source> <target> [options]

Options:
  -p, --port <port>     Gateway port for new molt
  -d, --base-dir <dir>  Base directory for molts
  --skip-onboard        Skip OpenClaw onboarding
  -v, --verbose         Enable verbose output
```

### molt-dashboard
Get dashboard URL for a molt.

```bash
./.scripts/molt-dashboard <name> [options]

Options:
  -H, --host <host>     Host/IP address to use in URL [default: auto-detect]
  -d, --base-dir <dir>  Base directory for molts
  -o, --open            Open browser with the URL
  -v, --verbose         Enable verbose output

Examples:
  ./.scripts/molt-dashboard my-molt              # Prints URL
  ./.scripts/molt-dashboard my-molt -o           # Prints URL and opens browser
  ./.scripts/molt-dashboard my-molt -H 192.168.1.5  # Use specific IP
```

## Privacy Note

The `molts/` directory is automatically excluded from git via `.gitignore`. This ensures:
- Your OpenClaw configurations stay private
- User data and credentials aren't committed
- Each deployment is isolated

Only the management scripts are shared - your actual molts remain personal.

## Contributing

Contributions welcome! These scripts are built with [parseArger](https://github.com/BunnySweety/parseArger) for robust argument parsing.

## License

MIT License - See [LICENSE](LICENSE) file.
