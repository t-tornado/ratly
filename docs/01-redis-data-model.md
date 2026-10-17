# Redis Data Model

Every piece of state the rate limiter and dashboard need, which key holds it, who writes it and who reads it.

No database is used yet. Redis holds all live state. Anything that must outlive Redis (long-term history, durable custom limits) is future work for Postgres.

---

## Overview

| Key | Type | Holds | TTL |
| --- | --- | --- | --- |
| `rate:user:<userId>` | Hash | The user's current window: `count`, `bonus`, `paused` | Window length (3600 s), set when the window starts |
| `limit:user:<userId>` | String | The user's custom limit | None |
| `paused:user:<userId>` | String | Present = throttling paused | Pause length |
| `users:last_seen` | Sorted set | Every user ever seen; score = last request time (ms) | None |
| `stats:429:<YYYY-MM-DD>` | String | Rejected requests that day (UTC) | 2 days |

Naming rule: `<what>:<scope>:<id>`. Colons are only a convention, but they group keys in tools like RedisInsight.

---

## `rate:user:<userId>`: the current window

```
rate:user:42
  count  → 95    requests spent in this window
  bonus  → 20    extra requests granted by an admin, this window only
  paused → 40    requests made while throttling was paused (not counted against the limit)
```

- **Created by:** the request script, on the user's first request of a window (paused or not).
- **TTL:** set once, when the window starts. Never refreshed, so the window can't slide.
- **Changed by:** the request script (`count` or `paused`), the add-extra admin action (`bonus`).
- **Deleted by:** expiry (the hourly reset) or the reset admin action.
- **Missing key means:** no active window. Used = 0, status OK, full limit available.

All three fields disappear together when the window ends. That's what makes the bonus last for "the current window only" with nothing to clean up.

**Rule:** this key must always have a TTL. It's only ever created inside a Lua script that sets the expiry in the same atomic step. Never write to it with a plain command that could create it.

---

## `limit:user:<userId>`: custom limit

```
limit:user:42 → "150"
```

- **Written by:** the adjust-limit admin action (`SET`).
- **Deleted by:** the reset-to-default admin action (`DEL`).
- **Read by:** the request script on every request.
- **Missing key means:** the user is on the default limit (100).

---

## `paused:user:<userId>`: throttling pause

```
paused:user:42 → "1"   (TTL 1800)
```

- **Written by:** the pause admin action (`SET ... EX <seconds>`).
- **Deleted by:** expiry (pause ends on its own) or the unlock admin action.
- **Read by:** the request script.
- The value doesn't matter; only whether the key exists.

---

## `users:last_seen`: every user

```
users:last_seen
  user:42 → 1760708700000
  user:7  → 1760707320000
```

- **Member:** user ID. **Score:** time of their last request, in ms, from Redis's clock.
- **Written by:** the request script, on every request (allowed, rejected or paused).
- **No TTL.** A TTL would delete every user at once.

Answers:

| Question | Command |
| --- | --- |
| Total users | `ZCARD users:last_seen` |
| Active since time T | `ZCOUNT users:last_seen T +inf` |
| Users active in a time range | `ZRANGE users:last_seen <from> <to> BYSCORE` |
| A user's last request | `ZSCORE users:last_seen <userId>` |
| Does this user exist | `ZSCORE` returns non-null |
| Search by user ID | `ZSCAN users:last_seen 0 MATCH *<text>*` |

Invariant: a user exists in this set after their first request. Their window key may still be missing (window expired).

---

## `stats:429:<YYYY-MM-DD>`: rejections per day

```
stats:429:2026-10-17 → "312"
```

- **Written by:** the request script, on every rejection.
- **TTL:** 2 days, set on the first rejection of the day. Yesterday stays readable; older days clean themselves up.
- **Date:** UTC, computed in Node (Lua in Redis has no date functions) and passed in as a key.
- **Missing key means:** no rejections that day yet.

---

## Derived values (not stored)

| Value | How it's computed |
| --- | --- |
| Effective limit | `limit:user:<id>` if set, else 100 |
| Allowed this window | effective limit + `bonus` |
| Remaining | `max(0, allowed - count)` |
| Reset time | now + `TTL rate:user:<id>` |
| Status | `count / allowed`: >= 100% Exceeded, >= 90% Warning, otherwise OK |

Status is a "right now" value. When the window key expires, the user is OK again; past "exceeded" states are history, which Redis doesn't keep.

---

## Open questions

- [x] **Top users and % near limit** — resolved: scan all window keys on the stats timer tick. `dashboard-stats.lua` already runs every 10 s; it will iterate `users:last_seen`, read each user's window hash, and return the top N by usage ratio. Fine for thousands of users.
- [x] **Status filter at scale:** same approach. The stats tick reads every window key; the result includes per-user status, so the dashboard can filter client-side.
- [ ] **Durability:** custom limits and pauses are settings, not temporary data. If Redis restarts without persistence, they're lost. Enable AOF now; move custom limits to Postgres later.
