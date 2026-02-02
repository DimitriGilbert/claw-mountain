# AGENTS.md

This is a CLI for managing isolated OpenClaw bot instances (molts) with dedicated users, home directories, and configurations.

## Architecture

Each molt is a Linux user with:
- Isolated home directory in `<name>/` (relative to project root)
- Dedicated OpenClaw configuration and state
- Auto-assigned unique port (19001, 19021, 19041...)
- Docker group membership for sandboxing
- No sudo access for security

## Tooling

- **Entry point**: `./clmnt` - Main CLI for all operations
- **Argument parsing**: Uses [parseArger](https://github.com/DimitriGilbert/parseArger) for robust CLI handling
- **Base directory**: Default is where clmnt lives (`./`) (configurable with `-d` flag)
- **Logs**: Stored in `<name>/.openclaw/gateway.log`

## Command Structure

All commands are accessed through `./clmnt <subcommand> <action>`:

### Molt Subcommands (`./clmnt molt <action>`)

**Core Lifecycle:**
- `create` - Create new molt with user, config, and directory structure
- `start` - Start OpenClaw gateway for a molt
- `stop` - Stop running gateway (graceful with `--force` option)
- `delete` - Complete removal (user, home, processes)

**Monitoring & Access:**
- `list` - Show all molts with status
- `status` - Detailed status for specific molt
- `logs` - View/tail gateway logs (`-f` for follow mode)
- `dashboard` - Get dashboard URL (auto-detects server IP)
- `health` - Check molt health status
- `health-watch` - Continuously monitor molt health

**Development Tools:**
- `shell` - Interactive shell as molt user
- `exec` - Execute commands as molt user
- `browser` - Launch browser with isolated profile per molt
- `clone` - Copy configuration from existing molt to new one

**Advanced Operations:**
- `mail` - Mail-related commands for the molt
- `daemonize` - Run commands as daemonized processes
- `dropzone-setup` - Configure dropzone file transfer

### Fleet Subcommands (`./clmnt fleet <action>`)

- `backup` - Backup entire fleet configuration
- `restore` - Restore fleet from backup
- `list-backups` - List available fleet backups

## Common Workflows

**Create and start a new molt (LAN access, personal agent):**
```bash
./clmnt molt create my-bot
sudo -u my-bot openclaw onboard
./clmnt molt start my-bot
```

**Create with specific options:**
```bash
# Loopback only (localhost access only)
./clmnt molt create my-bot --bind loopback

# Restricted agent (always sandboxed)
./clmnt molt create public-bot --agent-type restricted

# Custom auth token
./clmnt molt create my-bot --token my-secret-token-123

# Read-only agent with custom port
./clmnt molt create readonly-bot --agent-type readonly --port 19021
```

**Agent Types:**
- `personal` (default) - Full access, no sandboxing
- `restricted` - Always sandboxed, no workspace access  
- `readonly` - Sandboxed with read-only workspace access
- `groups` - Groups sandboxed, DMs run on host

**Check status and logs:**
```bash
./clmnt molt list
./clmnt molt logs my-bot -f
```

**Browser automation setup:**
```bash
./clmnt molt browser my-bot -b chrome -u https://gmail.com
```

**Fleet management:**
```bash
./clmnt fleet backup my-backup-name
./clmnt fleet restore my-backup-name
./clmnt fleet list-backups
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

### NO "any" TYPES - ZERO TOLERANCE

**ALWAYS USE PROPER TYPES. NEVER USE "any".**

- **FORBIDDEN**: `any`, `: any`, `as any`, `unknown[]` (without proper typing)
- **FORBIDDEN**: `{ [key: string]: any }` - use proper mapped types or interfaces
- **FORBIDDEN**: Function parameters without types
- **FORBIDDEN**: Implicit `any` from missing type annotations
- **FORBIDDEN**: `Object` type - use `Record<string, T>` or specific interfaces

**Acceptable Patterns**:
- Use union types for specific values: `'success' | 'error' | 'loading'`
- Use generics for reusable components: `<T extends object>`
- Use proper interfaces for data shapes
- Use `unknown` with type guards for runtime validation
- Use utility types: `Partial<T>`, `Required<T>`, `Pick<T, K>`

**When you don't know the type**:
1. Define it properly with an interface
2. Use a specific type from schema/API
3. Create a utility type
4. Ask - do not default to `any`

### NO ASSUMPTIONS - ZERO TOLERANCE

**WHEN YOU DON'T KNOW SOMETHING, YOU DO NOT ASSUME. YOU FIND THE INFORMATION.**

- **FORBIDDEN**: Making assumptions about behavior, naming conventions, or system design
- **FORBIDDEN**: Guessing how external tools or systems work without verification
- **FORBIDDEN**: Hallucinating documentation or API behavior
- **FORBIDDEN**: "I assume..." or "Probably..." or "It should..."

**Required Actions When Uncertain**:
1. **STOP** - Do not proceed with assumptions
2. **SEARCH** - Use web search, docs, or grep to find the truth
3. **READ** - Fetch documentation, read source code, check examples
4. **VERIFY** - Confirm with multiple sources if needed
5. **ASK** - If still uncertain, ask the user for clarification

**Examples of Violations**:
- Assuming systemd service names without checking docs
- Assuming file paths or directory structures
- Assuming how external tools (openclaw, docker, etc.) work
- Assuming default values or behavior

**Ground yourself in knowledge, not speculation.**

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
