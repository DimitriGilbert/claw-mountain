# Molt Fleet Dashboard

A unified control plane for managing your molt swarm.

## Features

- **Fleet Status**: Real-time visualization of all molts with status, ports, and health
- **Health Monitoring**: Track molt uptime, response times, and failure patterns
- **Multi-Executor**: Broadcast messages to all running molts simultaneously
- **Deep Links**: Direct access to individual molt dashboards
- **Auto-Refresh**: Live updates every 5 seconds

## Architecture

```
.dashboard/
 ├── server/          # Bun + Elysia backend (port 3000)
 │   └── src/index.ts # API routes + static file serving
 └── client/          # React + Vite frontend (port 3001 dev, served by server in prod)
     ├── src/
     │   ├── App.tsx              # Main application
     │   ├── main.tsx             # Entry point
     │   ├── theme.css            # Design tokens and CSS variables
     │   ├── index.css            # Tailwind v4 mappings
     │   ├── types/               # TypeScript type definitions
     │   └── components/
     │       ├── MoltList.tsx     # Molt card grid
     │       ├── HealthPanel.tsx   # Health monitoring details
     │       ├── BroadcastPanel.tsx # Broadcast message panel
     │       └── ui/              # Reusable UI component library
     │           ├── Card.tsx      # Base card with status accents
     │           ├── Badge.tsx     # Status badges
     │           ├── Button.tsx    # Button variants (primary, secondary, danger, ghost)
     │           ├── Stat.tsx      # Header statistics
     │           ├── HealthIndicator.tsx # Health status with dot
     │           ├── EmptyState.tsx # Empty state with terminal styling
     │           ├── TerminalText.tsx # Monospace text component
     │           └── index.ts     # Component exports
```

## Quick Start

### Prerequisites
- Bun installed (https://bun.sh)
- Molts created and configured

### Development Mode

```bash
# Terminal 1: Start backend
cd .dashboard/server
bun install
bun run dev

# Terminal 2: Start frontend (in another terminal)
cd .dashboard/client
bun install
bun run dev
```

Then open http://localhost:3001

### Production Mode

```bash
# Build frontend
cd .dashboard/client
bun install
bun run build

# Start server (serves both API and built frontend)
cd .dashboard/server
bun install
bun run dev  # or build and start
```

Then open http://localhost:3000

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/molts` - List all molts (JSON)
- `GET /api/molts/:name/status` - Get molt status
- `POST /api/molts/:name/start` - Start a molt
- `POST /api/molts/:name/stop` - Stop a molt
- `GET /api/molts/:name/logs?lines=50` - Get molt logs
- `GET /api/molts/:name/dashboard` - Get dashboard URL
- `POST /api/broadcast` - Broadcast message to all running molts
- `GET /api/molts/:name/health` - Get health status
- `POST /api/molts/:name/health/setup` - Setup health monitoring
- `GET /api/molts/:name/history` - Get uptime history
- `GET /api/molts/:name/watch-state` - Get health watch state

## Design System

The dashboard uses a custom "Soft Terminal Modernism" aesthetic:

- **Color Palette**: Deep navy backgrounds (`#0a0f14`), green success states (`#4ade80`), soft coral errors (`#f87171`), teal accents (`#14b8a6`)
- **Typography**: JetBrains Mono for headers/data, Inter for body text
- **Component Library**: 8 reusable UI components for consistency
- **Design Tokens**: CSS custom properties defined in `theme.css`

See `.docs/artistic_direction.md` for complete design guidelines.

## How It Works

The dashboard:
1. Calls `clmnt molt list --json` to get fleet status
2. Discovers ports/tokens from `molts/*/openclaw.json`
3. Sends webhooks to each molt's `/hooks/agent` endpoint
4. Uses isolated sessions so broadcasts don't pollute main chats
