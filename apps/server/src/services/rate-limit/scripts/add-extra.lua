-- KEYS[1]  rate:user:<userId>
-- ARGV[1]  amount

-- No active window: refuse. A plain HINCRBY here would create
-- a window hash with no TTL, which would never reset.
if redis.call('EXISTS', KEYS[1]) == 0 then
  return -1
end

return redis.call('HINCRBY', KEYS[1], 'bonus', tonumber(ARGV[1]))
