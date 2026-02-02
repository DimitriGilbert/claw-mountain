# Dashboard AGENTS.md

A TypeScript monorepo containing a Bun/Elysia backend and React frontend for managing molt fleets.

## Code Quality - READ THIS OR ELSE

### STRICT PROHIBITION: NEVER RUN DEV SERVERS

**DO NOT EVER START DEVELOPMENT SERVERS.**

- **NEVER run `npm run dev`, `bun run dev`, or ANY dev server command**
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
2. Use a specific type from the schema/API
3. Create a utility type
4. Ask - do not default to `any`

**FAILURE TO COMPLY RESULTS IN IMMEDIATE TERMINATION**

### LSP Errors Are Blocking Errors

**When you see an LSP error, YOU STOP EVERYTHING AND FIX IT.**

- **LSP errors are NOT suggestions** - they are real problems that make the codebase worse
- **Do NOT continue working** until all LSP errors are resolved
- **Do NOT ignore diagnostics** in the tool output - they matter
- **Fix errors immediately** - do not "come back to them later"

For `.dashboard/` TypeScript/React code:
- Run `bun run check-types` in both `client/` and `server/` directories
- But also watch for LSP diagnostics after every edit
- CSS/Tailwind theme errors are still errors - fix them
- Unused variables, missing props, type mismatches - ALL must be fixed
- Type errors including implicit `any` usage - fix immediately

**FAILURE TO FOLLOW THESE RULES RESULTS IN IMMEDIATE TERMINATION**

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
