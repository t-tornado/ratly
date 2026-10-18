# Backend Technical Decisions

---

## 1. User existence check before rate limit actions is not a TOCTOU

Admin endpoints check `ZSCORE users:last_seen <id>` first and return `404` if the user is unknown. The subsequent Redis mutations (incrementing counts, setting pauses, etc.) run only after that check passes.

A TOCTOU vulnerability requires that the checked condition can change between the check and the act. That condition — user existence — cannot change here.

**Why it is safe:**

- Users are never deleted. `users:last_seen` is append-only: a `ZADD` adds or updates a score, nothing removes entries.
- There is no admin endpoint, background job, or TTL that erases a user key.
- Because deletion is not possible, if the existence check passes, the user record will still be present when the mutation runs — regardless of any concurrency.

If user deletion were ever introduced, this check would need to move inside the same Lua script as the mutation, making it atomic. Until then, the two-step approach is correct.

---

## 2. Fixed window for rate limiting

Each user gets a Redis hash (`rate:user:<id>`) with a TTL equal to the window length. A Lua script increments the request count and reads the limit atomically. When the hash expires, the next request opens a fresh window.

**Why fixed over sliding window or token bucket:**

| Criterion | Fixed window | Sliding window | Token bucket |
| --- | --- | --- | --- |
| Redis structure | One hash + TTL | Sorted set of timestamps | Hash + last-refill timestamp |
| Lua complexity | Low | High | Medium |
| Atomic admin actions | Straightforward | Hard (sorted set manipulation) | Medium |
| Reset semantics | `DEL` the hash | Drain sorted set | Reset tokens field |
| Predictability | Window boundary is explicit | Continuous, harder to explain | Continuous |

The admin actions (reset, extra requests, pause) were the deciding factor. They all operate on the same hash. Implementing "add 20 extra requests" or "reset the window" against a sorted set of timestamps is significantly more complex and error-prone.

**Known tradeoff:** a user can burst up to 2× the limit across a window boundary (max requests at end of window N, max again at start of window N+1). This is acceptable for this use case. The window length is short enough that the burst is bounded, and pausing or adjusting the limit are the correct tools if a specific user abuses it.

---

## 3. Activity tracking uses pre-aggregated per-minute counters

Activity tracking uses per-minute counters in Redis hashes, not individual request timestamps. One hash per user per day (`activity:user:<id>:YYYY-MM-DD`) with fields `HH:MM:allowed` and `HH:MM:rejected`, incremented atomically inside `fixed-window.lua`.

**Why pre-aggregated counters over individual timestamps:**

| Criterion | Pre-aggregated counters | Individual timestamps |
| --- | --- | --- |
| Storage | Fixed: max 2880 fields/day (1440 min × 2) | Unbounded: one entry per request |
| Write cost | HINCRBY (O(1)) | ZADD or LPUSH per request |
| Read cost | HGETALL one hash | Range query + aggregation |
| Lua complexity | One HINCRBY per exit point | Timestamp serialization per request |

**Key design choices:**

- **TTL: 48 hours.** Covers "past day" queries that span midnight (need today's hash + yesterday's hash). No data needed beyond that.
- **Minute granularity.** Matches the finest useful resolution for a stacked bar chart. Sub-minute is noise for this use case.
- **30-minute aggregation for "day" range.** The server aggregates minute-level data into 30-minute buckets (48 bars) to match the density of the "hour" view (60 bars). Aggregation happens at read time, not write time, so the raw minute data is always available.
- **Atomic increment inside `fixed-window.lua`.** The activity counter is updated in the same Lua script that decides allow/reject. No extra round-trip, no race between the decision and the counter.
