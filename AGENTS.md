# AGENTS.md

This is a collection of bash scripts for managing isolated OpenClaw bot instances (molts) with dedicated users, home directories, and configurations.

## Architecture

Each molt is a Linux user with:
- Isolated home directory in `<name>/` (relative to project root)
- Dedicated OpenClaw configuration and state
- Auto-assigned unique port (19001, 19021, 19041...)
- Docker group membership for sandboxing
- No sudo access for security

## Tooling

- **Argument parsing**: All scripts use [parseArger](https://github.com/BunnySweety/parseArger) for robust CLI handling
- **Base directory**: Default is `/home/didi/molts` (configurable with `-d` flag)
- **Logs**: Stored in `<name>/.openclaw/gateway.log`

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

Molt configs are stored in `<name>/.openclaw/openclaw.json`:
- Port assignment in `gateway.port`
- Workspace path in `agents.defaults.workspace`
- Environment variables in `.openclaw/.env`

## Progressive Disclosure

- **Script reference**: See README.md for full command documentation
- **OpenClaw configuration**: See [OpenClaw docs](https://docs.openclaw.ai/)
- **parseArger usage**: Each script has declarations at the top showing available options
- **Dashboard development**: See `.dashboard/AGENTS.md` for TypeScript/React monorepo guidelines

## Privacy Note

The individual molt directories are gitignored. Each deployment's bot instances remain personal and uncommitted.

## Code Quality - READ THIS OR ELSE

### STRICT PROHIBITION: NEVER RUN DEV SERVERS

**DO NOT EVER START DEVELOPMENT SERVERS.**

- **NEVER run `npm run dev`, `bun run dev`, `python manage.py runserver`, or ANY dev server command**
- **DO NOT start services** - this is a MAJOR VIOLATION
- **NO servers, NO daemons, NO background processes** of any kind
- **Ask for permission first** - do not assume it's okay to test/preview
- **This rule is absolute** - there are no exceptions

**FAILURE TO COMPLY RESULTS IN IMMEDIATE TERMINATION**

### LSP Errors Are Blocking Errors

**When you see an LSP error, YOU STOP EVERYTHING AND FIX IT.**

- **LSP errors are NOT suggestions** - they are real problems that make the codebase worse
- **Do NOT continue working** until all LSP errors are resolved
- **Do NOT ignore diagnostics** in the tool output - they matter
- **Fix errors immediately** - do not "come back to them later"

### Workflow When You See an Error

1. **STOP** - Do not make more changes
2. **READ** - Understand what the error is telling you
3. **FIX** - Resolve the error completely
4. **VERIFY** - Confirm LSP shows no errors
5. **CONTINUE** - Only then proceed with your task

### Important Distinctions

- **tsc (TypeScript compiler)** catches compile-time errors
- **LSP (Language Server)** catches real-time errors during editing
- Both must pass, but **LSP errors appear immediately and must be fixed immediately**

### Dashboard Development Specifics

For `.dashboard/` TypeScript/React code:
- Run `bun run check-types` in both `client/` and `server/` directories
- But also watch for LSP diagnostics after every edit
- CSS/Tailwind theme errors are still errors - fix them
- Unused variables, missing props, type mismatches - ALL must be fixed

**FAILURE TO FOLLOW THESE RULES RESULTS IN IMMEDIATE TERMINATION**
