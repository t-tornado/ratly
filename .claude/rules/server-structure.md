---
globs: apps/server/**
---

# Server App Structure Rules

Applies to: `apps/server/`

## Folder layout

```
src/
├── app.module.ts          ← root module — imports all feature modules
├── app.controller.ts      ← root HTTP endpoint (health / proxy)
├── main.ts                ← bootstrap only
├── lib/
│   ├── infra/
│   │   └── redis/         ← RedisService, RedisModule
│   ├── types/
│   │   └── index.ts       ← server-local types + re-exports from @ratly/core
│   ├── constants.ts       ← server-only constants
│   └── redis-keys.ts      ← Redis key factory
├── services/
│   └── <feature>/
│       ├── <feature>.service.ts
│       ├── <feature>.module.ts
│       ├── <feature>.interceptor.ts   ← if feature needs an interceptor
│       ├── <feature>.decorator.ts     ← if feature exposes a decorator
│       └── scripts/                   ← Lua scripts (if feature uses atomic Redis ops)
│           ├── index.ts               ← loads .lua files, exports named constants + decoders
│           ├── <script-name>.lua
│           └── <decoder>.ts           ← pure TS decoder for Lua output (if complex)
├── controllers/
│   └── <feature>/
│       └── <feature>.controller.ts
└── events/
    ├── events.gateway.ts
    └── events.module.ts
```

## Feature module pattern

Each feature is a NestJS module in `services/<feature>/`. The module owns its service and any providers.

```ts
@Module({
  imports: [EventsModule],          // only what this feature actually needs
  providers: [FeatureService],
  exports: [FeatureService],        // export only if other modules import this one
})
export class FeatureModule {}
```

- Register every feature module in `app.module.ts`.
- Mark a module `@Global()` only if it truly needs to be available everywhere (e.g. `RateLimitModule`).
- Export a service only when other modules depend on it — not by default.

## Controllers

Controllers live in `controllers/<feature>/`, not alongside their service.

Controllers are thin. They:
- Accept HTTP parameters
- Call one or more services
- Emit events via `EventsGateway` if the operation mutates state
- Return the result

Controllers do **not**:
- Validate business rules (belongs in the service)
- Contain any logic beyond call → emit → return

```ts
@Post(":id/reset")
async resetWindow(@Param("id") userId: string) {
  const row = await this.adminService.resetWindow(userId);
  this.eventsGateway.emitRateUpdate(row);
  return row;
}
```

## Services

All business logic and validation lives in services.

- Validate inputs (throw `BadRequestException`, `NotFoundException`, `ConflictException` from `@nestjs/common`)
- Guard existence with private `assert*` helpers before mutating state
- Return domain types (`UserRow`, `DashboardStats`) — never raw Redis output

```ts
private async assertUserExists(userId: string): Promise<void> {
  const exists = await this.rateLimitService.userExists(userId);
  if (!exists) throw new NotFoundException(`User ${userId} not found`);
}
```

## Redis keys

All Redis key strings go through `lib/redis-keys.ts`. Never hardcode a key string anywhere else.

```ts
// lib/redis-keys.ts
export const redisKeys = {
  userRate:      (userId: string) => `rate:user:${userId}`,
  userLimit:     (userId: string) => `limit:user:${userId}`,
  usersLastSeen: "users:last_seen",
};
```

As the key set grows, group by domain within the same object — do not split into multiple files unless the file becomes unmanageable.

## Lua scripts

Use Lua scripts for atomic multi-key Redis operations. Never replicate the same logic with multiple round-trips.

- Scripts live in `services/<feature>/scripts/`
- `scripts/index.ts` loads every `.lua` file with `readFileSync` at startup and exports named constants
- If the Lua return value is a flat array that needs decoding, write a pure TS decoder (e.g. `all-rows.ts`) and export it from `scripts/index.ts`

```ts
// scripts/index.ts
const loadScript = (name: string) => readFileSync(resolve(SCRIPTS_DIR, name), "utf-8");

export const fixedWindowScript = loadScript("fixed-window.lua");
export { unpackAllRows } from "./all-rows.js";
```

## Real-time events

All WebSocket emissions go through `EventsGateway` methods. Never call `this.server.emit` outside the gateway.

- `emitRateUpdate(row)` — after any mutation to a user's rate state
- `emitLimitExceeded(row)` — emitted by the interceptor on 429
- `emitDashboardStats(stats)` — emitted on the stats interval

Add a new named emit method to the gateway for each new event type. Do not pass raw event strings from services or controllers.

## Types

### Where types live

| Type | Location |
|------|----------|
| Shared between server and UI | `packages/core/src/types/` |
| Server-local (e.g. `ConsumeResult`) | `lib/types/index.ts` |
| Cross-service re-exports | `lib/types/index.ts` re-exports from `@ratly/core` |

### Import rule

Import types within the server from `../../lib/types/index.js` — not directly from `@ratly/core`. The one exception is event name constants in the gateway, which import directly from `@ratly/core`.

```ts
// good — inside a service
import { UserRow } from "../../lib/types/index.js";

// also good — in events.gateway.ts only
import { RATE_UPDATE_EVENT } from "@ratly/core";
```

## Constants

| Constant | Location |
|----------|----------|
| Shared with UI (e.g. `DEFAULT_LIMIT`) | `packages/core/src/constants/` |
| Server-only (e.g. `WINDOW_SECONDS`, `STATS_INTERVAL_MS`) | `lib/constants.ts` |

`lib/constants.ts` re-exports shared constants from core so service files have one import point:

```ts
export { DEFAULT_LIMIT } from "@ratly/core";
export const WINDOW_SECONDS = 3600;
```

## `@ratly/core` boundary

Core is for types and constants consumed by **both** server and UI. Nothing else.

Do not put in core:
- Server infrastructure (Redis, NestJS)
- Business logic or algorithms
- Server-only constants or types
- Anything with a Node.js-only import
