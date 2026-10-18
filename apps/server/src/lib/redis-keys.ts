export const redisKeys = {
  userRate:       (userId: string) => `rate:user:${userId}`,
  userLimit:      (userId: string) => `limit:user:${userId}`,
  userPaused:     (userId: string) => `paused:user:${userId}`,
  userLastReset:  (userId: string) => `last_reset:user:${userId}`,
  usersLastSeen:  "users:last_seen",
  stats429:       (date: string)   => `stats:429:${date}`,
};
