# Dashboard AGENTS.md

A TypeScript monorepo containing a Bun/Elysia backend and React frontend for managing molt fleets.

## Package Manager

This dashboard uses Bun for all operations. Use `bun` commands, not npm/yarn.

## Monorepo Structure

- **`server/`**: Bun + Elysia backend (port 3000)
- **`client/`**: React + Vite frontend (dev port 3001, served by server in prod)

## Commands

**Server:**
- Dev: `cd server && bun run dev`
- Build: `cd server && bun run build`
- Typecheck: `cd server && bun run check-types`

**Client:**
- Dev: `cd client && bun run dev`
- Build: `cd client && bun run build`
- Typecheck: `cd client && bun run check-types`

## Progressive Disclosure

- **Server API routes**: See `server/src/index.ts` for all endpoints
- **Dashboard architecture**: See `README.md` for feature overview
