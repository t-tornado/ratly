---
globs: packages/**
---

# Packages Rules

Applies to: `packages/`

## `@ratly/core`

Shared code consumed by both `apps/server` and `apps/ui`.

### The rule

If it is not used by **both** server and UI, it does not belong in core.

### What goes in core

- **Shared types** — interfaces and type aliases that both sides work with (`UserRow`, `DashboardStats`, `ServerEvent`)
- **Shared constants** — values both sides reference (`DEFAULT_LIMIT`, event name strings)
- **Pure business logic** — functions with no dependencies, no I/O, no side effects, where the same rule runs on both client and server (e.g. computing a status from a ratio, validating a limit value)

### What does not go in core

- Anything with a runtime dependency (no `dependencies` in `package.json`, ever)
- Node.js-only code (no `fs`, `path`, `crypto`, process APIs)
- Browser-only code (no DOM, no `window`, no `localStorage`)
- Server infrastructure (NestJS, Redis, Lua scripts)
- UI infrastructure (React, hooks, Tailwind)
- Server-only types or constants — put those in `apps/server/src/lib/`
- UI-only types or constants — put those in `apps/ui/src/lib/`

### Dependency rule

`packages/core` has **no runtime dependencies**. `devDependencies` is TypeScript only.

If you think something needs a dependency, it belongs in the app that uses it, not in core.

### Structure

```
packages/core/src/
├── index.ts           ← barrel — export everything core exposes
├── types/
│   ├── index.ts
│   ├── user.ts        ← UserRow, TopUser
│   ├── stats.ts       ← DashboardStats
│   └── events.ts      ← ServerEvent union + per-event types
└── constants/
    ├── index.ts
    ├── rateLimiting.ts ← DEFAULT_LIMIT and other shared rate-limit values
    └── events.ts       ← event name string constants
```

Add pure logic files at `src/utils/<subject>.ts` if a computation needs to be shared. Keep each file focused on one domain.

### Adding to core

Before adding anything to core, confirm both:

1. Server imports it (or will)
2. UI imports it (or will)

If only one side needs it, put it in that app's `lib/`.
