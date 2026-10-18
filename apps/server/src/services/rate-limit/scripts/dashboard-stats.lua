-- KEYS[1]  users:last_seen
-- KEYS[2]  stats:429:<YYYY-MM-DD>
-- ARGV[1]  "active" window in ms (e.g. 900000 = 15 min)
-- ARGV[2]  default limit
-- ARGV[3]  top N users to return (e.g. 10)
-- ARGV[4]  near-limit threshold ratio (e.g. 0.9)

local t   = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)

local total    = redis.call('ZCARD', KEYS[1])
local active   = redis.call('ZCOUNT', KEYS[1], now - tonumber(ARGV[1]), '+inf')
local rejected = tonumber(redis.call('GET', KEYS[2]) or '0')

-- Scan every user's window to find top consumers by usage ratio.
local defaultLimit    = tonumber(ARGV[2])
local topN            = tonumber(ARGV[3])
local nearThreshold   = tonumber(ARGV[4])
local userIds         = redis.call('ZRANGE', KEYS[1], 0, -1)
local top             = {}   -- { userId, count, allowed, ratio } per user with an active window
local activeWindowCount = 0
local nearLimitCount    = 0

for i = 1, #userIds do
  local uid = userIds[i]
  local wKey = 'rate:user:' .. uid
  local w    = redis.call('HMGET', wKey, 'count', 'bonus')
  local count = tonumber(w[1] or '0')

  -- Skip users with no active window (count 0, key expired).
  if count > 0 then
    activeWindowCount = activeWindowCount + 1
    local bonus   = tonumber(w[2] or '0')
    local lKey    = 'limit:user:' .. uid
    local limit   = tonumber(redis.call('GET', lKey) or defaultLimit)
    local allowed = limit + bonus
    local ratio   = count / allowed  -- 0..N, >1 means exceeded

    if ratio >= nearThreshold then
      nearLimitCount = nearLimitCount + 1
    end

    top[#top + 1] = { ratio, uid, count, allowed }
  end
end

-- Sort descending by count, keep top N.
table.sort(top, function(a, b) return a[3] > b[3] end)

-- Flatten into a single array: [ uid, count, allowed, uid, count, allowed, ... ]
local flat = {}
for i = 1, math.min(topN, #top) do
  flat[#flat + 1] = top[i][2]  -- userId
  flat[#flat + 1] = top[i][3]  -- count
  flat[#flat + 1] = top[i][4]  -- allowed
end

local nearLimitPercent = activeWindowCount > 0
  and math.floor(nearLimitCount / activeWindowCount * 1000 + 0.5) / 10
  or 0

return { total, active, rejected, now, nearLimitPercent, unpack(flat) }
