import { UserRow } from "../../../lib/types/index.js";

const USER_FIELD_COUNT = 8;

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
    const lastSeen    = flat[i + 7] as number;

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
      at: now,
    });
  }

  return rows;
}
