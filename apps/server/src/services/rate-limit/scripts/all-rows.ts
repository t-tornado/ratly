import { UserRow } from "../../../lib/types/index.js";

/** Fields per user in the Lua flat array: userId, used, bonus, pausedCount, limit, windowTtl, pauseTtl, lastSeen, lastAdminResetAt, rejectedToday. */
const USER_FIELD_COUNT = 10;

/**
 * Decodes the flat array returned by `all-rows.lua` into {@link UserRow}[].
 *
 * Lua returns `[now, ...fields]` where each user occupies a
 * {@link USER_FIELD_COUNT}-wide stride. Timestamps in the Lua
 * output are seconds-based TTLs — this function converts them
 * to absolute epoch-ms values using `now`.
 *
 * @see RateLimitService.readAllRows — caller
 * @see all-rows.lua — produces the flat array
 */
export function unpackAllRows(flat: (string | number)[]): UserRow[] {
  if (!flat || flat.length < 1) return [];

  const now = flat[0] as number;
  const rows: UserRow[] = [];

  for (let i = 1; i < flat.length; i += USER_FIELD_COUNT) {
    const userId      = flat[i] as string;
    const used        = flat[i + 1] as number;
    const bonus       = flat[i + 2] as number;
    const pausedCount = flat[i + 3] as number;
    const limit       = flat[i + 4] as number;
    const windowTtl   = flat[i + 5] as number;
    const pauseTtl    = flat[i + 6] as number;
    const lastSeen          = flat[i + 7] as number;
    const lastAdminResetAt  = flat[i + 8] as number;
    const rejectedToday     = flat[i + 9] as number;

    const allowedTotal = limit + bonus;
    const ratio = allowedTotal > 0 ? used / allowedTotal : 0;

    rows.push({
      userId,
      used,
      limit,
      bonus,
      allowedTotal,
      remaining: Math.max(0, allowedTotal - used),
      pausedCount,
      paused: pauseTtl > 0,
      pausedUntil: pauseTtl > 0 ? now + pauseTtl * 1000 : null,
      resetAt: windowTtl > 0 ? now + windowTtl * 1000 : null,
      status: ratio >= 1 ? "exceeded" : ratio >= 0.9 ? "warning" : "ok",
      lastRequestAt: lastSeen,
      lastAdminResetAt: lastAdminResetAt > 0 ? lastAdminResetAt : null,
      rejectedToday,
      at: now,
    });
  }

  return rows;
}
