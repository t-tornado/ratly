local key    = KEYS[1]
local limit  = tonumber(ARGV[1])
local window = tonumber(ARGV[2])


local count = redis.call('INCR', key)
if count == 1 then
  redis.call('EXPIRE', key, window)
end


local ttl = redis.call('TTL', key)
local allowed = 0
if count <= limit then
  allowed = 1
end

return { allowed, count, ttl }