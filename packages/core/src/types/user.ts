/**
 * Snapshot of a single user's rate-limit state.
 *
 * Assembled by Lua scripts on the server, consumed by both
 * dashboard table rows and the user detail page.
 *
 * @see RateLimitService.readRow — single-user fetch
 * @see unpackAllRows — bulk decode from Lua flat array
 */
export interface UserRow {
  userId: string;
  used: number;
  /** Base limit from DEFAULT_LIMIT or admin override. */
  limit: number;
  /** Temporary extra allowance granted by admin — resets with the window. */
  bonus: number;
  /** `limit + bonus` — the effective cap for this window. */
  allowedTotal: number;
  /** `max(0, allowedTotal - used)` — requests left before 429. */
  remaining: number;
  pausedCount: number;
  paused: boolean;
  /** Epoch ms when pause expires, null if not paused. */
  pausedUntil: number | null;
  /** Epoch ms when the current window resets, null if no active window. */
  resetAt: number | null;
  /** Derived from `used / allowedTotal` — ok (<0.9), warning (≥0.9), exceeded (≥1). */
  status: "ok" | "warning" | "exceeded";
  /** Epoch ms of last request seen by the rate limiter. */
  lastRequestAt: number;
  /** Epoch ms of last admin reset, null if never reset. */
  lastAdminResetAt: number | null;
  /** 429s returned today (UTC calendar day). */
  rejectedToday: number;
  /** Server timestamp (epoch ms) when this snapshot was taken. */
  at: number;
}

export interface TopUser {
  userId: string;
  used: number;
  allowedTotal: number;
}
