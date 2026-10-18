export interface UserRow {
  userId: string;
  used: number;
  limit: number;
  bonus: number;
  allowedTotal: number;
  remaining: number;
  pausedCount: number;
  paused: boolean;
  pausedUntil: number | null;
  resetAt: number | null;
  status: "ok" | "warning" | "exceeded";
  lastRequestAt: number;
  lastAdminResetAt: number | null;
  at: number;
}

export interface TopUser {
  userId: string;
  used: number;
  allowedTotal: number;
  ratio: number;
}
