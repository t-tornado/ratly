import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { UserRow, DashboardStats, TopUser } from "@ratly/core";
import type { LiveEvent } from "../components/LiveEventsFeed";

const NOW = 1_700_000_000_000;
const HOUR_MS = 3_600_000;

export const mockUserRow: UserRow = {
  userId: "usr_ok",
  used: 42,
  limit: 100,
  bonus: 0,
  allowedTotal: 100,
  remaining: 58,
  pausedCount: 0,
  paused: false,
  pausedUntil: null,
  resetAt: NOW + HOUR_MS,
  status: "ok",
  lastRequestAt: NOW - 5_000,
  at: NOW,
};

export const mockWarningRow: UserRow = {
  ...mockUserRow,
  userId: "usr_warning",
  used: 92,
  remaining: 8,
  status: "warning",
};

export const mockExceededRow: UserRow = {
  ...mockUserRow,
  userId: "usr_exceeded",
  used: 100,
  remaining: 0,
  status: "exceeded",
};

export const mockPausedRow: UserRow = {
  ...mockExceededRow,
  userId: "usr_paused",
  paused: true,
  pausedUntil: NOW + HOUR_MS,
};

export const mockBonusRow: UserRow = {
  ...mockUserRow,
  userId: "usr_bonus",
  bonus: 25,
  allowedTotal: 125,
  remaining: 83,
};

export const mockCustomLimitRow: UserRow = {
  ...mockUserRow,
  userId: "usr_custom_limit",
  limit: 200,
  allowedTotal: 200,
  remaining: 150,
};

export const mockRows: UserRow[] = [
  mockExceededRow,
  mockWarningRow,
  mockUserRow,
  mockPausedRow,
  mockBonusRow,
  mockCustomLimitRow,
];

export const mockTopUsers: TopUser[] = [
  { userId: "usr_exceeded", used: 100, allowedTotal: 100, ratio: 1.0 },
  { userId: "usr_warning",  used: 92,  allowedTotal: 100, ratio: 0.92 },
  { userId: "usr_ok",       used: 42,  allowedTotal: 100, ratio: 0.42 },
];

export const mockStats: DashboardStats = {
  totalUsers: 6,
  activeUsers: 4,
  rejectedToday: 3,
  topUsers: mockTopUsers,
  at: NOW,
};

export const mockLiveEvents: LiveEvent[] = [
  {
    time: "16:53",
    type: RATE_LIMIT_EXCEEDED_EVENT,
    description: "usr_exceeded \u00b7 retry 17:00:00",
    severity: "error",
  },
  {
    time: "16:52",
    type: RATE_UPDATE_EVENT,
    description: "usr_warning \u00b7 8 left",
    severity: "info",
  },
];
