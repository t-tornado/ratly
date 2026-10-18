-- KEYS[1]  users:last_seen
-- ARGV[1]  default limit
--
-- Returns a flat array:
--   index 0: now (epoch ms)
--   then per user (9 fields each):
--     userId, count, bonus, pausedCount, limit, windowTtl, pauseTtl, lastSeen, lastResetAt

local t   = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)

local members = redis.call('ZREVRANGE', KEYS[1], 0, -1, 'WITHSCORES')

local flat = { now }

for i = 1, #members, 2 do
  local uid      = members[i]
  local lastSeen = tonumber(members[i + 1])

  local rateKey   = 'rate:user:' .. uid
  local limitKey  = 'limit:user:' .. uid
  local pausedKey    = 'paused:user:' .. uid
  local lastResetKey = 'last_reset:user:' .. uid

  local w             = redis.call('HMGET', rateKey, 'count', 'bonus', 'paused')
  local count         = tonumber(w[1] or '0')
  local bonus         = tonumber(w[2] or '0')
  local pausedCount   = tonumber(w[3] or '0')
  local limit         = tonumber(redis.call('GET', limitKey) or ARGV[1])
  local windowTtl     = redis.call('TTL', rateKey)
  local pauseTtl      = redis.call('TTL', pausedKey)
  local lastResetAt   = tonumber(redis.call('GET', lastResetKey))

  flat[#flat + 1] = uid
  flat[#flat + 1] = count
  flat[#flat + 1] = bonus
  flat[#flat + 1] = pausedCount
  flat[#flat + 1] = limit
  flat[#flat + 1] = windowTtl
  flat[#flat + 1] = pauseTtl
  flat[#flat + 1] = lastSeen
  flat[#flat + 1] = lastResetAt or 0
end

return flat
