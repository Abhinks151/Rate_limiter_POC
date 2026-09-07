local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

-- Remove requests outside the window
redis.call(
  'ZREMRANGEBYSCORE',
  key,
  0,
  now - window
)

-- Count requests in the window
local count = redis.call(
  'ZCOUNT',
  key,
  '-inf',
  '+inf'
)

-- Rate limit reached
if count >= limit then
  return 0
end

-- Add current request
redis.call(
  'ZADD',
  key,
  now,
  now
)

-- Expire the key
redis.call(
  'EXPIRE',
  key,
  window
)

return 1