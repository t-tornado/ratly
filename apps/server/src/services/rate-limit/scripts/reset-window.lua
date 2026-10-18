-- KEYS[1]  rate:user:<userId>
-- KEYS[2]  last_reset:user:<userId>
-- ARGV[1]  now (ms timestamp)

redis.call('DEL', KEYS[1])
redis.call('SET', KEYS[2], ARGV[1])
