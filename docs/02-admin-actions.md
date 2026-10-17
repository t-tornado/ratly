# Admin Actions

The five admin controls from the task, what each one means, which keys it changes and its edge cases.

Scripts and calling code for each are in [03-flows-and-scripts.md](03-flows-and-scripts.md).

---

## Summary

| Action | Endpoint | Redis | Lasts |
| --- | --- | --- | --- |
| Reset limit | `POST /admin/users/:id/reset` | `DEL rate:user:<id>` | Instant |
| Adjust limit | `PUT /admin/users/:id/limit` | `SET limit:user:<id> <n>` | Until changed |
| Reset limit to default | `DELETE /admin/users/:id/limit` | `DEL limit:user:<id>` | Until changed |
| Add extra requests | `POST /admin/users/:id/extra` | `add-extra.lua` | Current window only |
| Pause throttling | `POST /admin/users/:id/pause` | `SET paused:user:<id> 1 EX <s>` | Pause length |
| Unlock (resume) | `DELETE /admin/users/:id/pause` | `DEL paused:user:<id>` | Instant |

---

## Rules for every action

1. **The user must exist.** Check `ZSCORE users:last_seen <id>`. If it's null, return `404`.
2. **Admin routes are not rate limited.** Mark the admin controller with `@SkipRateLimit()`.
3. **After the change, emit the user's new row** as a `rate:update`, so every dashboard's table and that user's detail view update. Read the row with `user-row.lua`.
4. **Validate input before touching Redis.** Return `400` on invalid values.

---

## 1. Reset limit

**Meaning:** start the user fresh. Their current window is wiped, and their next request opens a new one.

**Redis:** `DEL rate:user:<id>`

- Clears `count`, `bonus` and `paused` together. Any extra requests granted this window are gone too, since they belonged to that window.
- Doesn't touch their custom limit or an active pause.
- If the user has no active window, it does nothing. Still return success; the result (a fresh budget) is what the admin asked for.

---

## 2. Adjust limit

**Meaning:** give the user a different limit, permanently, until changed again.

**Body:** `{ "limit": 150 }`

**Redis:** `SET limit:user:<id> 150`. Overwrites any earlier custom limit.

**Validation:** whole number, at least 1. A limit of 0 would mean every request is rejected even with no window, which is better done as a block feature if it's ever needed.

**Effect:** applies on the very next request. The current `count` is kept; it's just checked against the new limit. A user at 100 of 100 becomes 100 of 150 and can make requests again. Lowering the limit below their current count makes them Exceeded until the window resets.

**Back to default:** `DELETE /admin/users/:id/limit` runs `DEL limit:user:<id>`; the request script falls back to 100.

---

## 3. Add extra requests

**Meaning:** give the user N more requests, valid only until their current window ends.

**Body:** `{ "amount": 20 }`

**Redis:** `HINCRBY rate:user:<id> bonus 20`, run through `add-extra.lua`.

**Validation:** whole number, at least 1. Optionally cap it (e.g. 1000) to avoid typos.

**Why a script and not a plain `HINCRBY`:** if the window expires between checking it and adding the bonus, `HINCRBY` would create a new window hash with **no TTL**. That user would then have a permanent window that never resets. The script checks and adds in one atomic step.

**Edge case: no active window.** The user's window already expired, so there's no current window to add to. Return `409 Conflict` with a message like "User has no active window; their limit is already fully available."

**Why a bonus field and not lowering `count`:** both give the same room, but lowering `count` would hide the user's real usage. With `bonus`, the dashboard can show "95 used, +20 extra."

---

## 4. Pause throttling

**Meaning:** stop enforcing the limit for this user for a while. Requests are still recorded, but never rejected.

**Body:** `{ "seconds": 1800 }`

**Redis:** `SET paused:user:<id> 1 EX 1800`. Pausing an already-paused user resets the pause to the new length.

**Validation:** whole number, at least 60, at most 86400 (1 day). "Temporarily" means a pause must always end.

**Effect on counting:** while paused, requests increment the window's `paused` field instead of `count`. So:

- the pause is a true free pass: when it ends, the user is back where they were, not suddenly Exceeded;
- the dashboard can still show how many requests were made while paused.

**Does not need an active window.** A pause can be set any time; the user's next request will open a window as normal.

---

## 5. Unlock (resume throttling)

**Meaning:** end a pause early.

**Redis:** `DEL paused:user:<id>`

The next request is checked against the limit again. If there's no pause, it does nothing; still return success.

---

## Errors

| Status | When |
| --- | --- |
| `400` | Invalid body (not a whole number, out of range) |
| `404` | User has never made a request |
| `409` | Add extra requests with no active window |
| `503` | Redis unavailable |

---

## Not covered yet

- **Admin authentication.** The task doesn't define admins; at minimum, protect these routes with an admin key header.
- **Audit log.** Who changed what and when. Needs Postgres.
