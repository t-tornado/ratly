-- KEYS[1]  rate:user:<userId>
-- KEYS[2]  limit:user:<userId>
-- KEYS[3]  paused:user:<userId>
-- KEYS[4]  users:last_seen
-- KEYS[5]  last_reset:user:<userId>
-- KEYS[6]  activity:user:<userId>:<YYYY-MM-DD>
-- ARGV[1]  userId
-- ARGV[2]  default limit

local t   = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)

-- Unknown user: return nil (null in Node) so the caller can 404.
local lastSeen = redis.call('ZSCORE', KEYS[4], ARGV[1])
if not lastSeen then
  return nil
end

local w             = redis.call('HMGET', KEYS[1], 'count', 'bonus', 'paused')
local count         = tonumber(w[1] or '0')
local bonus         = tonumber(w[2] or '0')
local pausedCount   = tonumber(w[3] or '0')
local limit         = tonumber(redis.call('GET', KEYS[2]) or ARGV[2])
local windowTtl     = redis.call('TTL', KEYS[1])   -- -2 = no active window
local pauseTtl      = redis.call('TTL', KEYS[3])   -- -2 = not paused
local lastResetAt   = tonumber(redis.call('GET', KEYS[5]))

-- Sum all :rejected fields from today's activity bucket.
local rejectedToday = 0
local activityFields = redis.call('HGETALL', KEYS[6])
for i = 1, #activityFields, 2 do
  if string.sub(activityFields[i], -9) == ':rejected' then
    rejectedToday = rejectedToday + tonumber(activityFields[i + 1])
  end
end

return { count, bonus, pausedCount, limit, windowTtl, pauseTtl, tonumber(lastSeen), now, lastResetAt or 0, rejectedToday }
