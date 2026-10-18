-- KEYS[1]  rate:user:<userId>       window hash: count, bonus, paused
-- KEYS[2]  limit:user:<userId>      custom limit (optional)
-- KEYS[3]  paused:user:<userId>     pause flag (optional)
-- KEYS[4]  users:last_seen          every user, score = last request (ms)
-- KEYS[5]  stats:429:<YYYY-MM-DD>   today's rejections (UTC)
-- KEYS[6]  activity:user:<userId>:<YYYY-MM-DD>  per-minute activity counters
-- ARGV[1]  userId
-- ARGV[2]  default limit
-- ARGV[3]  window length in seconds

local userId = ARGV[1]
local window = tonumber(ARGV[3])

local t   = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)

-- Compute HH:MM bucket from Redis TIME for activity tracking.
local totalSeconds = tonumber(t[1])
local hours   = math.floor(totalSeconds % 86400 / 3600)
local minutes = math.floor(totalSeconds % 3600 / 60)
local minuteBucket = string.format('%02d:%02d', hours, minutes)

-- Track activity: increment the appropriate counter and set 48h TTL if new.
local function trackActivity(outcome)
  local field = minuteBucket .. ':' .. outcome
  redis.call('HINCRBY', KEYS[6], field, 1)
  if redis.call('TTL', KEYS[6]) == -1 then
    redis.call('EXPIRE', KEYS[6], 172800)
  end
end

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
  trackActivity('allowed')
  return { 1, count, allowed, redis.call('TTL', KEYS[1]), now, 1 }
end

-- 4. Over the limit: reject without spending.
if count >= allowed then
  local rejected = redis.call('INCR', KEYS[5])
  if rejected == 1 then
    redis.call('EXPIRE', KEYS[5], 172800)  -- 2 days
  end
  trackActivity('rejected')
  return { 0, count, allowed, redis.call('TTL', KEYS[1]), now, 0 }
end

-- 5. Allowed: spend one. Start the window clock only when the window is new.
count = redis.call('HINCRBY', KEYS[1], 'count', 1)
if isNew then
  redis.call('EXPIRE', KEYS[1], window)
end

trackActivity('allowed')
return { 1, count, allowed, redis.call('TTL', KEYS[1]), now, 0 }
