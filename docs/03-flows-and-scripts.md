# Flows and Lua Scripts

Step-by-step flows for every operation, with the Lua script each one runs and the Nest code that calls it.

Keys are described in [01-redis-data-model.md](01-redis-data-model.md); admin rules in [02-admin-actions.md](02-admin-actions.md).

---

## Scripts at a glance

| Script | Used by | Writes |
| --- | --- | --- |
| `fixed-window.lua` | Every rate-limited request | Window, last seen, 429 counter |
| `dashboard-stats.lua` | Stats timer, snapshot route | Nothing |
| `user-row.lua` | Snapshot route, after every admin action | Nothing |
| `add-extra.lua` | Add extra requests | Window `bonus` |

Reset, adjust limit, pause and unlock are single commands and don't need scripts.

---

## Shared conventions

**Every key a script touches is passed in `KEYS`**, never built inside the script. Redis needs to know them up front (required for Cluster).

**Arguments arrive as strings.** Convert with `tonumber`.

**Missing values come back as `false` in Lua, not `nil`.** That's why the scripts use `x or '0'`.

**Time comes from Redis's clock**, so every server instance and every timestamp agree:

```lua
local t   = redis.call('TIME')   -- { seconds, microseconds } as strings
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
```

**Return `1`/`0`, not `true`/`false`.** Lua `false` comes back to Node as `null`.

---

## Flow 1: A request comes in

1. **Guard:** no `x-user-id` header → `401`.
2. **Interceptor (before):** run `fixed-window.lua`.
3. **Rejected:** emit `rate:limit_exceeded`, then throw `429` with the retry time.
4. **Allowed:** the controller runs.
5. **Interceptor (after):** set `x-count` to the remaining requests, emit `rate:update`.

Emits are fire-and-forget. If Redis is unreachable or times out (~100 ms), fail open: let the request through and log a warning.

### `fixed-window.lua`

```lua
-- KEYS[1]  rate:user:<userId>       window hash: count, bonus, paused
-- KEYS[2]  limit:user:<userId>      custom limit (optional)
-- KEYS[3]  paused:user:<userId>     pause flag (optional)
-- KEYS[4]  users:last_seen          every user, score = last request (ms)
-- KEYS[5]  stats:429:<YYYY-MM-DD>   today's rejections (UTC)
-- ARGV[1]  userId
-- ARGV[2]  default limit
-- ARGV[3]  window length in seconds

local userId = ARGV[1]
local window = tonumber(ARGV[3])

local t   = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)

-- 1. Every request updates last seen.
redis.call('ZADD', KEYS[4], now, userId)

-- 2. Read everything the decision needs.
local limit   = tonumber(redis.call('GET', KEYS[2]) or ARGV[2])
local paused  = redis.call('EXISTS', KEYS[3]) == 1
local isNew   = redis.call('EXISTS', KEYS[1]) == 0

local w       = redis.call('HMGET', KEYS[1], 'count', 'bonus')
local count   = tonumber(w[1] or '0')
local bonus   = tonumber(w[2] or '0')
local allowed = limit + bonus

-- 3. Paused: record it, never reject, don't spend from the budget.
if paused then
  redis.call('HINCRBY', KEYS[1], 'paused', 1)
  if isNew then
    redis.call('EXPIRE', KEYS[1], window)
  end
  return { 1, count, allowed, redis.call('TTL', KEYS[1]), now, 1 }
end

-- 4. Over the limit: reject without spending.
if count >= allowed then
  local rejected = redis.call('INCR', KEYS[5])
  if rejected == 1 then
    redis.call('EXPIRE', KEYS[5], 172800)  -- 2 days
  end
  return { 0, count, allowed, redis.call('TTL', KEYS[1]), now, 0 }
end

-- 5. Allowed: spend one. Start the window clock only when the window is new.
count = redis.call('HINCRBY', KEYS[1], 'count', 1)
if isNew then
  redis.call('EXPIRE', KEYS[1], window)
end

return { 1, count, allowed, redis.call('TTL', KEYS[1]), now, 0 }
```

**Returns** `{ allowed, used, allowedTotal, ttlSeconds, nowMs, paused }`.

Why each step is where it is:

- **Check before spending** (step 4 before step 5): rejected requests don't add to `count`, so it never goes past the limit and "remaining" stays truthful.
- **`isNew` is read before any write**, because after the first `HINCRBY` the key always exists.
- **The expiry is set only when the window is new.** Setting it on every request would keep pushing the reset back, and an active user would never reset.
- **A paused request also starts a window** if none exists, so "the window starts at the first request" holds either way.

### Calling it

```ts
// lib/rate-limit/strategies/fixed-window.strategy.ts
import { readFileSync } from 'fs';
import { join } from 'path';

const SCRIPT = readFileSync(join(__dirname, '..', 'scripts', 'fixed-window.lua'), 'utf8');
const DEFAULT_LIMIT = 100;
const WINDOW_SEC = 3600;

@Injectable()
export class FixedWindowStrategy implements RateLimitStrategy {
  constructor(private readonly redis: RedisService) {}

  async consume(userId: string): Promise<RateLimitResult> {
    const today = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD

    const [allowed, used, allowedTotal, ttl, now, paused] = (await this.redis.client.eval(SCRIPT, {
      keys: [
        `rate:user:${userId}`,
        `limit:user:${userId}`,
        `paused:user:${userId}`,
        'users:last_seen',
        `stats:429:${today}`,
      ],
      arguments: [userId, String(DEFAULT_LIMIT), String(WINDOW_SEC)],
    })) as number[];

    return {
      allowed: allowed === 1,
      paused: paused === 1,
      used,
      allowedTotal,
      remaining: Math.max(0, allowedTotal - used),
      resetAt: ttl > 0 ? now + ttl * 1000 : null,
      now,
    };
  }
}
```

---

## Flow 2: Dashboard loads (and every reconnect)

1. Open the WebSocket; attach listeners for `rate:update`, `rate:limit_exceeded`, `dashboard_stats:update`.
2. `GET /admin/dashboard`: returns stats (from `dashboard-stats.lua`) and table rows (from `user-row.lua`, one per user).
3. Render the snapshot.
4. Apply events as they arrive. For stats, keep whichever value has the newer `at`.

### Building the table rows

```ts
const userIds = await this.redis.client.zRange('users:last_seen', 0, -1, { REV: true }); // most recent first
const rows = await Promise.all(userIds.map((id) => this.readRow(id)));
```

node-redis sends these concurrent calls together in one batch, but it's still one script run per user. Fine for thousands of users; see the open questions in the data model for larger numbers.

---

## Flow 3: Stats timer tick (every 10 s)

1. Run `dashboard-stats.lua`.
2. Emit `dashboard_stats:update` to the `dashboard` room.

One timer for the whole server, started when the gateway module starts.

### `dashboard-stats.lua`

```lua
-- KEYS[1]  users:last_seen
-- KEYS[2]  stats:429:<YYYY-MM-DD>
-- ARGV[1]  "active" window in ms (e.g. 900000 = 15 min)
-- ARGV[2]  default limit
-- ARGV[3]  top N users to return (e.g. 10)

local t   = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)

local total    = redis.call('ZCARD', KEYS[1])
local active   = redis.call('ZCOUNT', KEYS[1], now - tonumber(ARGV[1]), '+inf')
local rejected = tonumber(redis.call('GET', KEYS[2]) or '0')

-- Scan every user's window to find top consumers by usage ratio.
local defaultLimit = tonumber(ARGV[2])
local topN         = tonumber(ARGV[3])
local userIds      = redis.call('ZRANGE', KEYS[1], 0, -1)
local top          = {}   -- { userId, count, allowed, ratio } per user with an active window

for i = 1, #userIds do
  local uid = userIds[i]
  local wKey = 'rate:user:' .. uid
  local w    = redis.call('HMGET', wKey, 'count', 'bonus')
  local count = tonumber(w[1] or '0')

  -- Skip users with no active window (count 0, key expired).
  if count > 0 then
    local bonus   = tonumber(w[2] or '0')
    local lKey    = 'limit:user:' .. uid
    local limit   = tonumber(redis.call('GET', lKey) or defaultLimit)
    local allowed = limit + bonus
    local ratio   = count / allowed  -- 0..N, >1 means exceeded

    top[#top + 1] = { ratio, uid, count, allowed }
  end
end

-- Sort descending by ratio, keep top N.
table.sort(top, function(a, b) return a[1] > b[1] end)

-- Flatten into a single array: [ uid, count, allowed, uid, count, allowed, ... ]
local flat = {}
for i = 1, math.min(topN, #top) do
  flat[#flat + 1] = top[i][2]  -- userId
  flat[#flat + 1] = top[i][3]  -- count
  flat[#flat + 1] = top[i][4]  -- allowed
end

return { total, active, rejected, now, unpack(flat) }
```

The first 4 values are the same as before. After that, groups of 3 (`userId`, `count`, `allowed`) repeat for up to N top users, sorted by usage ratio descending.

```ts
const TOP_N = 10;

const raw = (await this.redis.client.eval(STATS_SCRIPT, {
  keys: ['users:last_seen', `stats:429:${today}`],
  arguments: [String(15 * 60_000), String(DEFAULT_LIMIT), String(TOP_N)],
})) as (number | string)[];

const [totalUsers, activeUsers, rejectedToday, at] = raw as number[];

const topUsers: TopUser[] = [];
for (let i = 4; i < raw.length; i += 3) {
  topUsers.push({
    userId: String(raw[i]),
    used: Number(raw[i + 1]),
    allowedTotal: Number(raw[i + 2]),
    ratio: Number(raw[i + 1]) / Number(raw[i + 2]),
  });
}
```

---

## Flow 4: Reading one user's row

Used by the snapshot route and after every admin action.

### `user-row.lua`

```lua
-- KEYS[1]  rate:user:<userId>
-- KEYS[2]  limit:user:<userId>
-- KEYS[3]  paused:user:<userId>
-- KEYS[4]  users:last_seen
-- ARGV[1]  userId
-- ARGV[2]  default limit

local t   = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)

-- Unknown user: return nil (null in Node) so the caller can 404.
local lastSeen = redis.call('ZSCORE', KEYS[4], ARGV[1])
if not lastSeen then
  return nil
end

local w           = redis.call('HMGET', KEYS[1], 'count', 'bonus', 'paused')
local count       = tonumber(w[1] or '0')
local bonus       = tonumber(w[2] or '0')
local pausedCount = tonumber(w[3] or '0')
local limit       = tonumber(redis.call('GET', KEYS[2]) or ARGV[2])
local windowTtl   = redis.call('TTL', KEYS[1])   -- -2 = no active window
local pauseTtl    = redis.call('TTL', KEYS[3])   -- -2 = not paused

return { count, bonus, pausedCount, limit, windowTtl, pauseTtl, tonumber(lastSeen), now }
```

```ts
async readRow(userId: string): Promise<UserRow | null> {
  const res = (await this.redis.client.eval(ROW_SCRIPT, {
    keys: [`rate:user:${userId}`, `limit:user:${userId}`, `paused:user:${userId}`, 'users:last_seen'],
    arguments: [userId, String(DEFAULT_LIMIT)],
  })) as number[] | null;

  if (!res) return null;

  const [used, bonus, pausedCount, limit, windowTtl, pauseTtl, lastRequestAt, now] = res;
  const allowedTotal = limit + bonus;
  const ratio = used / allowedTotal;

  return {
    userId,
    used,
    limit,
    bonus,
    allowedTotal,
    remaining: Math.max(0, allowedTotal - used),
    pausedCount,
    paused: pauseTtl > 0,
    pausedUntil: pauseTtl > 0 ? now + pauseTtl * 1000 : null,
    resetAt: windowTtl > 0 ? now + windowTtl * 1000 : null,
    status: ratio >= 1 ? 'exceeded' : ratio >= 0.9 ? 'warning' : 'ok',
    lastRequestAt,
    at: now,
  };
}
```

---

## Flow 5: Admin actions

Every action follows the same shape:

1. Validate the body → `400` if invalid.
2. Check the user exists (`ZSCORE users:last_seen <id>`) → `404` if not.
3. Apply the change (below).
4. Read the row with `user-row.lua` and emit it as `rate:update`.
5. Return the row in the response.

### Reset limit

```ts
await this.redis.client.del(`rate:user:${userId}`);
```

### Adjust limit / back to default

```ts
await this.redis.client.set(`limit:user:${userId}`, String(limit));
await this.redis.client.del(`limit:user:${userId}`);
```

### Pause / unlock

```ts
await this.redis.client.set(`paused:user:${userId}`, '1', { EX: seconds });
await this.redis.client.del(`paused:user:${userId}`);
```

### Add extra requests: `add-extra.lua`

```lua
-- KEYS[1]  rate:user:<userId>
-- ARGV[1]  amount

-- No active window: refuse. A plain HINCRBY here would create
-- a window hash with no TTL, which would never reset.
if redis.call('EXISTS', KEYS[1]) == 0 then
  return -1
end

return redis.call('HINCRBY', KEYS[1], 'bonus', tonumber(ARGV[1]))
```

```ts
const bonus = (await this.redis.client.eval(ADD_EXTRA_SCRIPT, {
  keys: [`rate:user:${userId}`],
  arguments: [String(amount)],
})) as number;

if (bonus === -1) {
  throw new ConflictException('User has no active window; their limit is already fully available.');
}
```

---

## Build setup

`.lua` files aren't copied to `dist/` by default. In `nest-cli.json`:

```json
{
  "compilerOptions": {
    "assets": ["**/*.lua"],
    "watchAssets": true
  }
}
```

Load each script once at the top of its file (outside the class), so it's read at startup, not per request.
