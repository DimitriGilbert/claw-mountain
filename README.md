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
  - [molt mail](#molt-mail)
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
    ├── mail                   # Email management commands
    │   ├── add                # Add email account + auto-setup
    │   ├── check              # Manual sync & check
    │   ├── cron-setup         # Configure automated checking
    │   ├── remove             # Remove email account
    │   ├── skill              # Edit mail processing rules
    │   └── watch              # Manual trigger (testing)
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
  -b, --bind <mode>         Gateway bind mode: loopback|lan|tailnet [default: lan]
  --token <token>           Gateway auth token (auto-generated if not provided)
  -a, --agent-type <type>   Agent security profile: personal|restricted|readonly|groups
                            [default: personal]
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
  --install-isync           Install isync (IMAP sync tool for receiving emails)
```

**Agent Types:**
- `personal` (default) - Full host access, no sandboxing
- `restricted` - Always sandboxed, no workspace access
- `readonly` - Sandboxed with read-only workspace access
- `groups` - Group chats sandboxed, DMs run on host

**Examples:**
```bash
# Create a new molt with all default tools
./clmnt molt create helper-bot

# Create with specific port
./clmnt molt create my-bot -p 19021

# Create localhost-only for security
./clmnt molt create local-bot --bind loopback

# Create sandboxed public-facing bot
./clmnt molt create public-bot --agent-type restricted

# Create read-only exploration bot
./clmnt molt create readonly-bot --agent-type readonly --bind lan

# Create with custom token
./clmnt molt create my-bot --token my-secret-token-123

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

### molt mail

Comprehensive email management with automated checking and AI-powered processing.

Each molt can have multiple email accounts configured with automated checking that only triggers the AI when new mail actually arrives (not on a timer).

#### mail add

Add an email account with automatic setup of SMTP (msmtp), IMAP (mbsync), automated checking, and mail processing skill.

```bash
./clmnt molt mail add <name> <email> -p <password> [options]

Options:
  -p, --password <password>  Email password or app token [required]
  -P, --provider <provider>  Provider preset [gmail|outlook|custom] [default: gmail]
  -s, --smtp-host <host>     SMTP server host
  -i, --imap-host <host>     IMAP server host
  --smtp-port <port>         SMTP port [default: 587]
  --imap-port <port>         IMAP port [default: 993]
  -f, --from <address>       From address (defaults to email)
  --default                  Set as default account
  --no-tls                   Disable TLS
  --no-starttls              Disable STARTTLS (SMTP)
```

**Examples:**
```bash
# Add Gmail account (creates skill + cron automatically)
./clmnt molt mail add mybot mymail@gmail.com -p 'my-app-password'

# Add Outlook as default
./clmnt molt mail add mybot work@outlook.com -p 'password' -P outlook --default

# Add custom provider
./clmnt molt mail add mybot me@custom.com -p 'pass' -P custom \
  -s smtp.custom.com -i imap.custom.com
```

#### mail check

Manually sync and check emails (one-time, does not use cron).

```bash
./clmnt molt mail check <name> [options]

Options:
  -a, --account <name>    Check specific account only
  -l, --limit <num>       Number of latest emails to show [default: 10]
  --no-sync               Skip syncing (show cached only)
  -t, --test-smtp         Send test email
  -r, --test-recipient    Recipient for test email
  --list                  List configured accounts only
```

**Examples:**
```bash
# Sync and check all accounts
./clmnt molt mail check mybot

# List accounts only
./clmnt molt mail check mybot --list

# Test SMTP delivery
./clmnt molt mail check mybot -t -r test@example.com
```

#### mail remove

Remove an email account from a molt.

```bash
./clmnt molt mail remove <name> <account> [options]

Options:
  --yes                   Skip confirmation
  --keep-maildir          Keep Maildir folder after removal
```

**Examples:**
```bash
# Remove single account (with confirmation)
./clmnt molt mail remove mybot mymail__gmail

# Remove all accounts
./clmnt molt mail remove mybot all --yes
```

#### mail cron-setup

Configure automated mail checking as the molt user (cron job).

Each molt gets a staggered schedule based on its port number to prevent system spikes:
- Molt on port 19001: runs at :05 and :35 past the hour
- Molt on port 19021: runs at :15 and :45 past the hour
- etc.

```bash
./clmnt molt mail cron-setup <name> [options]

Options:
  -i, --interval <min>    Check interval in minutes [default: 30]
  -o, --offset <min>      Minute offset 0-29 (auto-calculated if not set)
  --remove                Remove the cron job
  --status                Show current cron status
```

**Examples:**
```bash
# Setup automated checking (auto-staggered)
./clmnt molt mail cron-setup mybot

# Check cron status
./clmnt molt mail cron-setup mybot --status

# Remove automation
./clmnt molt mail cron-setup mybot --remove

# Custom interval
./clmnt molt mail cron-setup mybot --interval 15
```

#### mail skill

Edit the mail-gatekeeper skill for this molt. This skill defines how the AI processes incoming emails.

```bash
./clmnt molt mail skill <name>
```

**Example:**
```bash
# Edit mail processing rules
./clmnt molt mail skill mybot
```

The skill is located at `molts/<name>/.openclaw/skills/mail-gatekeeper/SKILL.md` and contains:
- Processing rules for different email types
- Action definitions (notify, respond, create todo, etc.)
- Sender/subject patterns to match
- Default behaviors

#### mail watch

Manually trigger the mail watcher script (for testing). Runs as molt user.

```bash
# Manual check with verbose output
sudo -u mybot /path/to/claw-mountain/.scripts/_molt/_mail/watch --verbose

# Force trigger even if no new mail (for testing webhook)
sudo -u mybot /path/to/claw-mountain/.scripts/_molt/_mail/watch --force --verbose
```

## Workflow

### 1. Create a New Molt

```bash
# Standard personal molt with LAN access
./clmnt molt create my-assistant

# Localhost-only for extra security
./clmnt molt create my-assistant --bind loopback

# Sandboxed public-facing bot
./clmnt molt create public-bot --agent-type restricted
```

This will:
- Create user `my-assistant`
- Set home directory to `/home/didi/molts/my-assistant`
- Add user to docker group
- Create OpenClaw configuration with auto-assigned port
- Generate secure gateway auth token (displayed in output - save it!)
- Set secure defaults: dmPolicy=pairing, groupPolicy=allowlist
- Configure agent type (personal/restricted/readonly/groups)
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

### Email Automation Workflow

Set up a molt that automatically checks emails and processes them with AI:

```bash
# 1. Create molt (installs msmtp and isync)
./clmnt molt create my-email-bot

# 2. Add email account (auto-creates skill + cron)
./clmnt molt mail add my-email-bot work@company.com -p 'app-password'

# 3. Edit the processing rules
./clmnt molt mail skill my-email-bot
# Customize the mail-gatekeeper skill with your rules

# 4. Verify cron is set up
./clmnt molt mail cron-setup my-email-bot --status

# 5. Test manually
sudo -u my-email-bot ./.scripts/_molt/_mail/watch --verbose

# 6. Start the molt gateway
./clmnt molt start my-email-bot
```

**How it works:**
- Cron runs every 30 minutes (staggered per molt) as the molt user
- Syncs emails via mbsync (IMAP)
- Only calls AI webhook if NEW messages arrived
- AI processes emails using the mail-gatekeeper skill
- Skill defines rules: notify, respond, create todos, ignore, etc.
- Results posted to main session (isolated processing)

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
    ├── Maildir/                    # Email storage (per-account)
    │   └── <account-name>/         # Account-specific maildir
    │       ├── cur/                # Current messages
    │       ├── new/                # New messages
    │       └── tmp/                # Temp during delivery
    ├── .msmtprc                    # SMTP configuration (msmtp)
    ├── .mbsyncrc                   # IMAP configuration (mbsync)
    ├── .mail-state/                # Mail watcher state
    │   ├── last-check.json         # Last check timestamp
    │   └── cron.log                # Cron execution logs
    └── .openclaw/                  # OpenClaw configuration
        ├── openclaw.json           # OpenClaw config file
        ├── .env                    # Environment variables
        ├── workspace/              # Agent workspace
        ├── sandboxes/              # Sandbox directories
        ├── skills/                 # Per-molt skills
        │   └── mail-gatekeeper/    # Email processing skill
        │       └── SKILL.md        # Skill definition
        └── agents/
            └── main/
                └── sessions/       # Session storage
```

Documentation:
```
./.docs/
├── google_console_auth.md          # gogcli OAuth setup guide
├── mail_skill_template.md          # Template for mail-gatekeeper skill
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
    ├── mail                          # Email management router
    │   ├── add                       # Add email + setup automation
    │   ├── check                     # Manual sync & check
    │   ├── cron-setup                # Configure automated checking
    │   ├── remove                    # Remove email account
    │   ├── skill                     # Edit mail-gatekeeper skill
    │   └── watch                     # Mail watcher script (cron uses this)
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

### isync (mbsync)
Fast IMAP synchronization tool for receiving emails.
- Usage: `mbsync --help`
- Automatically configured by `clmnt molt mail add`
- Syncs IMAP to local Maildir (fast, efficient, scriptable)
- Used by automated mail checker

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
- Gateway auth tokens auto-generated (64-char hex) for LAN access
- Secure defaults enforced: dmPolicy=pairing, groupPolicy=allowlist, mdns=minimal
- Four agent types for different security profiles (personal, restricted, readonly, groups)
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

### Mail Not Being Checked Automatically

Check cron job status:
```bash
./clmnt molt mail cron-setup <name> --status
```

Check cron logs:
```bash
sudo -u <name> cat ~/molts/<name>/.mail-state/cron.log
```

Ensure webhook token is configured:
```bash
grep '"token"' ~/molts/<name>/.openclaw/openclaw.json
```

### AI Not Being Called for New Mail

Test the watcher manually:
```bash
sudo -u <name> ./.scripts/_molt/_mail/watch --verbose
```

Verify OpenClaw hooks are enabled:
```bash
grep -A5 '"hooks"' ~/molts/<name>/.openclaw/openclaw.json
```

### mbsync Fails to Sync

Check configuration:
```bash
sudo -u <name> cat ~/.mbsyncrc
```

Test manually:
```bash
sudo -u <name> mbsync -c ~/.mbsyncrc -a -V
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
