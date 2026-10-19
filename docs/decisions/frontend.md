# Frontend Technical Decisions

---

## 1. Client-side filtering paired with virtualization

**Problem:** Dashboard data comes from a live event stream held in memory. No server-side persistence, no query endpoint. High-volume streams produce thousands of rows — rendering all of them causes layout thrash and frame drops.

**Alternatives considered:**

- **Server-side filtering** — would need a database or paginated API to query against. We have neither. The data only exists as a live stream, so the client already holds everything. Adding server-side buffering per connection would be extra complexity for zero benefit.

**Decision:** Filter in-memory on the client (O(n), negligible cost). Virtualize the table so only visible rows are mounted — DOM size stays constant regardless of row count.

**Result:** UI stays responsive at scale. Filter reduces the source array, virtualizer handles what to render.

**Tradeoff:** In-memory event array grows unbounded over long sessions. Correct future fix is server-side persistence + paginated queries, not moving filtering to the server.

---

## 2. Per-row pub/sub store for real-time updates

**Problem:** Under load testing (500 users, 80 events/second), the dashboard table dropped frames. The profiler showed full-tree reconciliation on every WebSocket event. Frame times exceeded 60ms.

**Alternatives considered:**

- **Single `useSyncExternalStore` snapshot** — every event replaces the array reference, so React diffs every row even though only one changed. Doesn't scale.
- **React Query `setQueryData`** — 80+ cache updates per second, each notifying all observers on that key. Adds serialization overhead and fights the stale/refetch lifecycle which is built for request-response, not push.

**Decision:** Custom `createRowStore` — a plain `Map<userId, UserRow>` with per-row subscriber callbacks. An event for user X does an O(1) map lookup and calls that row's `setRow` directly — only that component re-renders. New users trigger a coalesced store-level notification for the ID list via `useSyncExternalStore`.

The critical difference from `useSyncExternalStore`-per-row: React's external store contract requires calling every subscriber's `getSnapshot` on every notification to check for changes. With N mounted rows, that's O(n) snapshot calls per single-row update — the check itself is cheap, but at 500+ rows and 80 events/sec the aggregate cost is measurable. The direct `setState` subscription bypasses this entirely: 1 event → 1 `setRow` → 1 re-render, O(1) end to end.

**Result:** < 16ms frame times under 500-user / 80-event/sec load. React Query still owns the initial fetch; the store takes over once the socket connects.

**Tradeoff:** ~50-line custom store maintained alongside React Query. State is duplicated briefly at initialization.
