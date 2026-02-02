# Molt Fleet Dashboard

A unified control plane for managing your molt swarm.

## Features

- **Fleet Status**: Real-time visualization of all molts with status, ports, and health
- **Multi-Executor**: Broadcast messages to all running molts simultaneously
- **Deep Links**: Direct access to individual molt dashboards
- **Auto-Refresh**: Live updates every 5 seconds

## Architecture

```
.dashboard/
├── server/          # Bun + Elysia backend (port 3000)
│   └── src/index.ts # API routes + static file serving
└── client/          # React frontend (port 3001 dev, served by server in prod)
    └── src/         # React components + CSS
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

## How It Works

The dashboard:
1. Calls `clmnt molt list --json` to get fleet status
2. Discovers ports/tokens from `molts/*/openclaw.json`
3. Sends webhooks to each molt's `/hooks/agent` endpoint
4. Uses isolated sessions so broadcasts don't pollute main chats
