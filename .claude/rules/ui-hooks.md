---
globs: apps/ui/**/hooks/**
---

# UI Hook Rules

Applies to: any `hooks/` directory under `apps/ui/`

## The rule

A hook file contains **only React wiring** — hooks, effects, subscriptions, memoization, and state. Every pure function, constant, type alias, and data transformation must live outside the hook file.

## What belongs in a hook file

- React hook calls (`useState`, `useEffect`, `useCallback`, `useMemo`, `useQuery`, etc.)
- Socket/event subscriptions
- Return value assembly
- Interface for the hook's own return type (e.g. `UseActivityParamsResult`)

## What does NOT belong in a hook file

- Pure functions (formatters, mappers, builders, validators, predicates)
- Constants (thresholds, defaults, lookup tables, option lists)
- Type aliases and interfaces that are not the hook's return type
- Data transformation logic (even if only used by this hook)

## Where extracted code goes

| Kind | Location |
|------|----------|
| Pure functions | `utils/<subject>.ts` in the same module (or `lib/utils/` if shared) |
| Constants | Same utils file if tightly coupled to the functions, otherwise `utils/<subject>.ts` or `lib/constants/` |
| Types | `types/<subject>.ts` in the same module (or `lib/types/` if shared) |

Name util files by **intent**, not by the hook they serve. `utils/eventStream.ts` not `utils/useUserDetailEventsHelpers.ts`. The util file should make sense on its own.

## Example

Bad — util logic inline in hook:
```ts
// hooks/useUserDetailStats.ts
const LOW_REMAINING_THRESHOLD = 10;

function getRemainingAccent(remaining: number) { ... }
function formatCountdown(resetAt: number) { ... }
function buildLiveStatItems(row: UserRow) { ... }

function useUserDetailStats(userId: string) {
  // ...hook wiring that calls the above
}
```

Good — hook imports from utils:
```ts
// utils/userStats.ts
export { formatCountdown, buildLiveStatItems };

// hooks/useUserDetailStats.ts
import { formatCountdown, buildLiveStatItems } from "../utils/userStats";

function useUserDetailStats(userId: string) {
  // ...only React wiring
}
```

## Enforcement

If a hook file defines a function that does not call a React hook, it is a violation. Move it to utils.
If a hook file defines a type that is not the hook's return interface, it is a violation. Move it to types.
If a hook file defines a module-level constant, it is a violation. Move it to utils or constants.
