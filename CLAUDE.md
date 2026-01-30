# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Client: `cd client && npm run dev` (Next.js with Turbopack on port 3002)
- Server: `cd server && npm run dev` (TypeScript backend)
- Lint: `cd client && npm run lint` or `cd server && npm run build`
- TypeCheck: `cd client && tsc --noEmit` or `cd server && tsc`
- Database: `cd server && npm run db:push` (update DB schema)
- Never run database migration scripts

## Architecture Overview

Monorepo with 5 packages: `client/` (Next.js dashboard), `server/` (Fastify API), `shared/` (types & utilities), `docs/` (documentation site), `monitor-agent/` (uptime monitoring service).

### Data Layer: Postgres vs ClickHouse

**PostgreSQL (Drizzle ORM)**: Relational data - users, organizations, sites, subscriptions, goals, funnels, API keys.

**ClickHouse**: Analytics events - pageviews, custom events, performance metrics, errors. Columnar storage partitioned by month, ordered by `(site_id, timestamp)`.

### Client API Pattern

Two-tier pattern in `client/src/api/`:
- `endpoints/` - Pure async functions using `authedFetch()` wrapper
- `hooks/` - React Query hooks wrapping endpoints
- Query keys: `["get-site", siteId]`

### Server Route Pattern

Fastify routes in `server/src/api/` → Service layer in `server/src/services/` → Database queries. Analytics endpoints use dynamic ClickHouse SQL with `getFilterStatement()` and `getTimeStatement()` utilities.

### Event Ingestion

Tracking SDK sends events to POST `/as` → Zod validation → Geolocation enrichment → ClickHouse insert.

### State Management

- **Zustand**: Global stores (user, organization, subscription) in `client/src/lib/store.ts`
- **React Query**: Server state & caching
- **Jotai**: Atomic UI state
- **nuqs**: URL state for filters/dates

## Code Conventions

- TypeScript with strict typing throughout
- Client: React functional components with minimal useEffect, inline handlers
- Frontend: Next.js, Tailwind CSS, Shadcn UI, Tanstack Query, Zustand, Luxon, Nivo, react-hook-form
- Backend: Fastify, Drizzle ORM (Postgres), ClickHouse, Zod
- Error handling: try/catch with specific error types
- Naming: camelCase for variables/functions, PascalCase for components/types
- Naming: `fetch*`/`create*`/`update*`/`delete*` for endpoints, `use*` for hooks
- Imports: Group by external, then internal (alphabetical)
- Dark mode is default theme
