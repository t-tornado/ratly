# Architecture Decisions

---

## 1. Redis-only, no database

The requirement is a rate limiter with a live admin dashboard. All state is ephemeral: request counts reset every hour, pauses expire on a TTL, and there is no requirement for historical data beyond 24 hours.

**Why no Postgres (or any SQL database):**

| What we need | Redis | Postgres |
| --- | --- | --- |
| Atomic check-and-increment per request | Lua script, single round-trip | Row lock or advisory lock, more latency |
| TTL-based window expiry | Native (`EXPIRE`) | Application-managed, needs a sweeper or scheduled job |
| Sub-millisecond reads for dashboard | In-memory, O(1) | B-tree index, still fast but adds a network hop and deserialisation |
| Pub/sub for live WebSocket updates | Built-in | `LISTEN/NOTIFY`, works but requires a persistent connection per subscriber |
| Admin actions (reset, pause, adjust) | Single `DEL` / `SET` / `HINCRBY` | `UPDATE` with transaction, adds complexity for no gain |

Adding Postgres would mean:
- A migration system and ORM for zero tables that need relational integrity
- Write-through or write-behind sync between Redis (fast path) and Postgres (persistence)
- A second infrastructure dependency with no feature payoff

Every data access pattern in this project maps naturally to Redis primitives. A database adds complexity without adding capability.

**When Postgres makes sense:**

- Historical analytics beyond 24 hours (aggregate time-series data)
- Audit log for admin actions (append-only, queryable by admin, user, or action type)
- User management with roles and permissions
- Multi-tenant configurations with relational constraints

These are in the [backlog](../backlog.md). When any of them becomes a requirement, adding Postgres is the right call. Until then, it's accidental complexity.

---

## 2. Ephemeral state by design

Nothing in this system is designed to survive a Redis restart. This is intentional, not an oversight.

**What happens on a cold start:**

- All rate windows are gone. Every user starts fresh.
- Custom limits are gone. Every user falls back to the default (100/hour).
- Pauses are gone. All users are unpaused.
- The dashboard is empty until users start making requests.

**Why this is acceptable:**

- Rate limiting is a protective mechanism, not a billing system. Losing state means users temporarily get extra capacity, which is the safe failure mode.
- The window length is one hour. Even with persistence, most state would expire naturally within that time.
- Admin overrides (custom limits, pauses) are rare and easily re-applied. The admin dashboard shows the current state; if something is missing, it's visible immediately.

**If persistence were required:**

Redis AOF or RDB snapshots would recover most state across restarts. For true durability (survive Redis data loss), the architecture would need a write-through layer to Postgres for custom limits and active pauses only, keeping the hot path in Redis.

---

## 3. Monorepo with shared types

The project uses a pnpm workspace monorepo:

```
packages/core/    shared types + constants (zero dependencies)
apps/server/      NestJS + Redis backend
apps/ui/          React + Vite frontend
apps/load/        Load testing scenarios
```

**Why monorepo over separate repos:**

- Shared types (`UserRow`, `DashboardStats`, `ServerEvent`) change together. A monorepo guarantees the server and UI always agree on the shape of data at build time, not at deploy time.
- One CI pipeline, one dependency tree, one version of TypeScript.
- The `@ratly/core` package enforces the boundary: it has zero runtime dependencies and contains only types, constants, and pure logic used by both sides.

**Why pnpm over npm:**

- Strict `node_modules` structure prevents phantom dependencies (importing a package you didn't explicitly depend on).
- Workspace protocol (`workspace:*`) gives first-class monorepo support with no hoisting surprises.

---

## 4. WebSocket for live updates, REST for snapshots

The dashboard needs both a point-in-time snapshot (on load) and continuous updates (as requests flow in).

**REST handles:**
- Initial dashboard load (`GET /admin/dashboard`) — returns stats + all user rows
- Admin actions (`POST /admin/users/:id/reset`, etc.) — returns the updated user row

**WebSocket handles:**
- `rate:update` — emitted after every request and every admin action
- `rate:limit_exceeded` — emitted when a user hits their limit
- `dashboard_stats:update` — emitted every 10 seconds with aggregated stats

**Why not WebSocket for everything:**

- REST gives the UI a complete snapshot it can render immediately. A WebSocket-only approach would need to stream the entire state on connect, which is harder to reason about and harder to cache.
- Admin actions need request-response semantics (success/failure, validation errors). HTTP maps cleanly; WebSocket would need custom correlation IDs.

**Why not SSE:**

- SSE is unidirectional. The dashboard needs to send room-join messages (e.g., subscribing to a specific user's detail view). WebSocket supports bidirectional communication natively.
