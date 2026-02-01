# Molt Management Scripts

A CLI tool to manage OpenClaw bot instances (molts) with isolated users, home directories, and configurations.

> **Note:** The `molts/` directory (where your actual bot instances live) is gitignored by default to keep your personal configurations private. See [Setup](#setup) below.

## Table of Contents

- [Setup](#setup)
- [Overview](#overview)
- [CLI Structure](#cli-structure)
- [Commands](#commands)
  - [molt create](#molt-create)
  - [molt list](#molt-list)
  - [molt status](#molt-status)
  - [molt start](#molt-start)
  - [molt stop](#molt-stop)
  - [molt browser](#molt-browser)
  - [molt logs](#molt-logs)
  - [molt shell](#molt-shell)
  - [molt exec](#molt-exec)
  - [molt clone](#molt-clone)
  - [molt dashboard](#molt-dashboard)
  - [molt delete](#molt-delete)
- [Workflow](#workflow)
- [Directory Structure](#directory-structure)
- [Multiple Molts](#multiple-molts)
- [Installed Tools](#installed-tools)
- [Security](#security)
- [Requirements](#requirements)
- [Troubleshooting](#troubleshooting)
- [Privacy Note](#privacy-note)
- [Contributing](#contributing)
- [License](#license)

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

3. **Start using the CLI:**
   ```bash
   ./clmnt molt create my-first-bot
   ```

## Overview

Each molt is an isolated OpenClaw bot instance with:
- Dedicated user account (no sudo access)
- Home directory in the current folder
- Docker group membership
- Isolated OpenClaw configuration and state
- Auto-assigned unique port (starting from 19001)

## CLI Structure

```
clmnt                          # Main CLI entry point
└── molt                       # Molt management subcommand
    ├── browser                # Launch browser as molt user
    ├── clone                  # Clone molt configuration
    ├── create                 # Create new molt
    ├── dashboard              # Get dashboard URL
    ├── delete                 # Delete molt
    ├── exec                   # Execute command as molt user
    ├── list                   # List all molts
    ├── logs                   # View molt logs
    ├── shell                  # Open shell as molt user
    ├── start                  # Start molt gateway
    ├── status                 # Check molt status
    └── stop                   # Stop molt
```

## Commands

### molt create

Creates a new molt with user, home directory, OpenClaw configuration, and optional development tools.

```bash
./clmnt molt create <name> [options]

Options:
  -p, --port <port>         Specify gateway port (auto-assigns if not provided)
  -d, --base-dir <dir>      Base directory for molts (default: /home/didi/molts)
  --skill <skill>           Additional skill to install (repeatable)
  --skip-user               Skip user creation (if user already exists)
  -v, --verbose             Enable verbose output

Tool Installation Flags (all default to 'on'):
  --install-parsearger      Install parseArger for bash argument parsing
  --install-bun             Install Bun JavaScript runtime
  --install-gemini          Install gemini-cli (Anthropic's CLI)
  --install-opencode        Install opencode AI assistant
  --install-gogcli          Install gogcli (Google Suite CLI - Gmail, Calendar, Drive)
  --install-msmtp           Install msmtp (simple SMTP client for sending emails)
```

**Examples:**
```bash
# Create a new molt with all default tools
./clmnt molt create helper-bot

# Create with specific port
./clmnt molt create my-bot -p 19021

# Create without certain tools
./clmnt molt create minimal-bot --no-install-gogcli --no-install-msmtp

# Create with additional skills
./clmnt molt create my-bot --skill owner/repo --skill another/repo skill-name
```

**Default Skills Installed:**
- parseArger: `parsearger-core`, `parsearger-utils`
- gemini-cli: `agents-md`, `frontend-design`, `not-ai-writer`
- opencode: All of the above plus `task-o-matic`

See `.docs/` for setup guides:
- [Google Cloud OAuth Setup](.docs/google_console_auth.md) - Required for gogcli
- [msmtp Email Setup](.docs/msmtp_setup.md) - Simple SMTP configuration

### molt list

Lists all molts and their status.

```bash
./clmnt molt list [options]

Options:
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  -v, --verbose         Show detailed information
```

### molt status

Check the running status of a specific molt.

```bash
./clmnt molt status <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  -v, --verbose         Enable verbose output
```

### molt start

Start a molt's OpenClaw gateway.

```bash
./clmnt molt start <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  -p, --port <port>     Override gateway port
  --daemon              Run as background daemon
  -v, --verbose         Enable verbose output
```

### molt stop

Stop a running molt.

```bash
./clmnt molt stop <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts (default: /home/didi/molts)
  -f, --force           Force kill if graceful stop fails
  -v, --verbose         Enable verbose output
```

### molt browser

Launch a browser as a specific molt user with isolated profile.

```bash
./clmnt molt browser <name> [options]

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
./clmnt molt browser my-molt

# Launch Chrome and open Gmail
./clmnt molt browser my-molt -b chrome -u https://gmail.com

# Launch headless browser for automation
./clmnt molt browser my-molt -b chromium --headless
```

Each molt gets its own isolated browser profile stored in `~/.browser-profiles/<browser>/`.

### molt logs

View or tail logs for a molt's OpenClaw gateway.

```bash
./clmnt molt logs <name> [options]

Options:
  -n, --lines <num>     Number of lines to show [default: 50]
  -f, --follow          Follow/tail logs in real-time
  -d, --base-dir <dir>  Base directory for molts
  -v, --verbose         Enable verbose output
```

**Examples:**
```bash
# Show last 50 lines
./clmnt molt logs my-molt

# Show last 100 lines
./clmnt molt logs my-molt -n 100

# Follow logs in real-time (Ctrl+C to exit)
./clmnt molt logs my-molt -f
```

### molt shell

Open an interactive shell as a molt user.

```bash
./clmnt molt shell <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts
  -v, --verbose         Enable verbose output
```

**Example:**
```bash
# Open bash shell as the molt user
./clmnt molt shell my-molt

# Then you can run commands as that user:
> openclaw channels login
> gog gmail labels list
> msmtp --help
```

### molt exec

Execute a command as a molt user without opening a shell.

```bash
./clmnt molt exec <name> <command> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts
  -v, --verbose         Enable verbose output
```

**Examples:**
```bash
# Run OpenClaw command
./clmnt molt exec my-molt "openclaw channels login"

# List files in molt's home
./clmnt molt exec my-molt ls -la

# Send email via msmtp
./clmnt molt exec my-molt "echo 'Subject: Test' | msmtp -t recipient@example.com"

# Check gogcli status
./clmnt molt exec my-molt "gog auth status"
```

### molt clone

Clone an existing molt configuration to a new molt.

```bash
./clmnt molt clone <source> <target> [options]

Options:
  -p, --port <port>     Gateway port for new molt
  -d, --base-dir <dir>  Base directory for molts
  --skip-onboard        Skip OpenClaw onboarding
  -v, --verbose         Enable verbose output
```

**Example:**
```bash
# Clone a configured molt to a new one
./clmnt molt clone production-bot staging-bot

# Clone with specific port
./clmnt molt clone my-molt my-molt-copy -p 19501
```

### molt dashboard

Get dashboard URL for a molt.

```bash
./clmnt molt dashboard <name> [options]

Options:
  -H, --host <host>     Host/IP address to use in URL [default: auto-detect]
  -d, --base-dir <dir>  Base directory for molts
  -o, --open            Open browser with the URL
  -v, --verbose         Enable verbose output
```

**Examples:**
```bash
# Print dashboard URL
./clmnt molt dashboard my-molt

# Print URL and open browser
./clmnt molt dashboard my-molt -o

# Use specific IP (for remote access)
./clmnt molt dashboard my-molt -H 192.168.1.5
```

### molt delete

Completely remove a molt (user, home directory, processes).

```bash
./clmnt molt delete <name> [options]

Options:
  -d, --base-dir <dir>  Base directory for molts
  --force               Skip confirmation prompt
  --keep-home           Keep home directory (only remove user)
  -v, --verbose         Enable verbose output
```

**Example:**
```bash
# Delete a molt (with confirmation)
./clmnt molt delete old-bot

# Force delete without confirmation
./clmnt molt delete old-bot --force

# Remove user but keep files
./clmnt molt delete old-bot --keep-home
```

## Workflow

### 1. Create a New Molt
```bash
./clmnt molt create my-assistant
```

This will:
- Create user `my-assistant`
- Set home directory to `/home/didi/molts/my-assistant`
- Add user to docker group
- Create OpenClaw configuration with auto-assigned port
- Create workspace and sandbox directories
- Install development tools (parseArger, Bun, gemini-cli, opencode, gogcli, msmtp)
- Install default skills for AI assistants

### 2. Configure Tools (Optional)

**For Google services (gogcli):**
Follow [.docs/google_console_auth.md](.docs/google_console_auth.md) to set up OAuth credentials, then:
```bash
sudo -u my-assistant gog auth credentials /path/to/client_secret.json
sudo -u my-assistant gog auth add your.email@gmail.com
```

**For simple email sending (msmtp):**
Follow [.docs/msmtp_setup.md](.docs/msmtp_setup.md) to configure:
```bash
sudo -u my-assistant tee ~/.msmtprc <<EOF
account gmail
host smtp.gmail.com
port 587
from your.email@gmail.com
user your.email@gmail.com
password your-app-password
tls on
tls_starttls on
auth on
default gmail
EOF
sudo -u my-assistant chmod 600 ~/.msmtprc
```

### 3. Setup OpenClaw
```bash
# Run onboarding as the molt user
sudo -u my-assistant openclaw onboard
```

### 4. Start the Molt
```bash
./clmnt molt start my-assistant
```

### 5. Check Status
```bash
# Check specific molt
./clmnt molt status my-assistant

# List all molts
./clmnt molt list
```

### 6. Stop the Molt
```bash
./clmnt molt stop my-assistant
```

## Directory Structure

Each molt has the following structure:

```
/home/didi/molts/
└── <molt-name>/                    # Molt home directory
    ├── .molt-info                  # Molt metadata
    ├── .local/bin/                 # User-installed tools (symlinks)
    │   ├── parseArger              # Bash argument parser
    │   ├── gog                     # Google Suite CLI
    │   └── ...                     # Other tools
    ├── parseArger/                 # parseArger installation (if copied)
    ├── gogcli/                     # gogcli source (if built from source)
    ├── .bun/                       # Bun JavaScript runtime
    ├── .nvm/                       # Node Version Manager (if needed)
    └── .openclaw/                  # OpenClaw configuration
        ├── openclaw.json           # OpenClaw config file
        ├── .env                    # Environment variables
        ├── workspace/              # Agent workspace
        ├── sandboxes/              # Sandbox directories
        └── agents/
            └── main/
                └── sessions/       # Session storage
```

Documentation:
```
./.docs/
├── google_console_auth.md          # gogcli OAuth setup guide
└── msmtp_setup.md                  # msmtp email configuration guide
```

Scripts:
```
./.scripts/
├── molt                            # Molt subcommand router
└── _molt/                          # Molt subcommands directory
    ├── browser
    ├── clone
    ├── create
    ├── dashboard
    ├── delete
    ├── exec
    ├── list
    ├── logs
    ├── shell
    ├── start
    ├── status
    └── stop
```

## Multiple Molts

Each molt gets its own unique port starting from 19001, incrementing by 20 to avoid conflicts:
- First molt: port 19001
- Second molt: port 19021
- Third molt: port 19041
- etc.

This ensures no port conflicts between browser control, canvas host, and CDP ports.

## Installed Tools

Each molt comes with a powerful toolkit for development and automation:

### parseArger
Bash argument parsing framework used by all these scripts.
- Usage: `parseArger --help`
- Location: Copied from your home directory

### Bun
Fast JavaScript runtime and package manager.
- Usage: `bun --help`
- Installed via: https://bun.sh

### gemini-cli
Anthropic's CLI for Claude AI.
- Usage: `gemini`
- Default skills: agents-md, frontend-design, not-ai-writer

### opencode
AI assistant CLI.
- Usage: `opencode`
- Default skills: parsearger-core, parsearger-utils, task-o-matic, agents-md, frontend-design, not-ai-writer

### gogcli
Full Google Suite CLI (Gmail, Calendar, Drive, Contacts, Tasks, Sheets, etc.).
- Usage: `gog --help`
- Setup required: See [.docs/google_console_auth.md](.docs/google_console_auth.md)
- Features: Read/send emails, manage calendar, upload/download Drive files, and more

### msmtp
Lightweight SMTP client for sending emails.
- Usage: `msmtp --help`
- Setup required: See [.docs/msmtp_setup.md](.docs/msmtp_setup.md)
- Features: Send emails via command line, perfect for scripts and automation
- Zero interactivity, configuration file-based

### Skills System
AI skills are installed via `npx skills` for gemini-cli and opencode:
- Skills add specialized knowledge and capabilities
- Default skills are installed automatically
- Add more with: `./clmnt molt create <name> --skill owner/repo`

## Security

- Each molt runs as a dedicated user with no sudo access
- Users are added to the docker group for OpenClaw sandboxing
- Home directories are isolated
- OpenClaw configurations are per-molt
- Gateway binds to loopback by default
- Tool credentials stored in molt's home directory (not system-wide)

## Requirements

- Linux system with useradd/usermod commands
- sudo access (for initial setup)
- Docker group (for sandboxing)
- parseArger installed (for argument parsing)

## Troubleshooting

### Permission Denied
If you get permission errors, ensure the scripts are executable:
```bash
chmod +x ./clmnt ./.scripts/molt ./.scripts/_molt/*
```

### Port Already in Use
If a port is already taken, the script will automatically try the next available port. You can also specify a port manually:
```bash
./clmnt molt create my-bot -p 19501
```

### Molt User Can't Access Docker
Ensure the user is in the docker group:
```bash
sudo usermod -aG docker <molt-name>
```
(The create script does this automatically)

### Gateway Won't Start
Check logs:
```bash
./clmnt molt logs <name> -f
```

## Privacy Note

The `molts/` directory is gitignored by default. This ensures:
- Your personal bot configurations stay private
- Credentials and API keys aren't committed
- Each deployment's molts remain separate

The scripts themselves (in `.scripts/`) can be committed if desired.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) file for details.
