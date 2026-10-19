/**
 * Architecture guard: all Redis key strings go through this object.
 *
 * Services and Lua scripts reference keys only via `redisKeys.*`.
 * Hard-coding a key string anywhere else is a violation — it
 * prevents key collisions and makes the key namespace auditable.
 *
 * Allowed:   `redisKeys.userRate(userId)`
 * Forbidden: `"rate:user:" + userId`
 */
export const redisKeys = {
  userRate:       (userId: string) => `rate:user:${userId}`,
  userLimit:      (userId: string) => `limit:user:${userId}`,
  userPaused:     (userId: string) => `paused:user:${userId}`,
  userLastReset:  (userId: string) => `last_reset:user:${userId}`,
  usersLastSeen:  "users:last_seen",
  stats429:       (date: string)   => `stats:429:${date}`,
  activityBucket: (userId: string, date: string) => `activity:user:${userId}:${date}`,
};
