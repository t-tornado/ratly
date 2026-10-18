import type { TopUser } from "./user.js";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  rejectedToday: number;
  nearLimitPercent: number;
  topUsers: TopUser[];
  at: number;
}
