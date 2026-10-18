import { useCallback, useEffect, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { RateUpdateEvent, RateLimitExceededEvent, UserRow } from "@ratly/core";

import { useSocket } from "../../../lib/hooks";
import { fetchUser, queryKeys } from "../../../lib/api";
import type { StatItem } from "../../../components/StatsRow";

type UserStatus = "ok" | "warning" | "exceeded" | null;

interface UserDetailStatsResult {
  statItems: StatItem[];
  status: UserStatus;
  currentRemaining: number | null;
  currentLimit: number | null;
  paused: boolean;
}

const STATUS_ACCENT: Record<string, StatItem["accent"]> = {
  ok: undefined,
  warning: "warning",
  exceeded: "error",
};

function formatCountdown(resetAt: number): string {
  const remainingMs = resetAt - Date.now();
  if (remainingMs <= 0) return "0s";

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

function formatTimestamp(epochMs: number): string {
  const date = new Date(epochMs);
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

function buildLiveStatItems(row: UserRow): StatItem[] {
  const remainingAccent = STATUS_ACCENT[row.status];

  const remainingItem: StatItem = {
    label: "Remaining",
    value: String(row.remaining),
    sub: row.bonus > 0 ? (
      `of ${row.allowedTotal} (admin override)`
    ) : (
      `of ${row.allowedTotal}`
    ),
    accent: remainingAccent,
  };

  const resetsInItem: StatItem = {
    label: "Resets in",
    value: row.resetAt ? formatCountdown(row.resetAt) : "--",
  };

  const lastResetTimestamp = row.resetAt;
  const lastResetItem: StatItem = {
    label: "Last reset",
    value: lastResetTimestamp ? formatTimestamp(lastResetTimestamp) : "--",
    sub: lastResetTimestamp ? "today" : undefined,
  };

  return [remainingItem, resetsInItem, lastResetItem];
}

const STATIC_STAT_ITEMS: StatItem[] = [
  {
    label: "Current window",
    value: "--",
    sub: "-- allowed · -- rejected",
  },
  {
    label: "429s today",
    value: "--",
    sub: "no data yet",
  },
];

function useUserDetailStats(userId: string): UserDetailStatsResult {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [, setTick] = useState(0);

  const { data: latestRow } = useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => fetchUser(userId),
    retry: false,
  });

  const updateRow = useCallback((row: UserRow) => {
    queryClient.setQueryData<UserRow>(queryKeys.user(userId), row);
  }, [queryClient, userId]);

  useEffect(() => {
    const handleRateUpdate = ({ row }: RateUpdateEvent) => {
      if (row.userId === userId) updateRow(row);
    };

    const handleLimitExceeded = ({ row }: RateLimitExceededEvent) => {
      if (row.userId === userId) updateRow(row);
    };

    socket.on(RATE_UPDATE_EVENT, handleRateUpdate);
    socket.on(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);

    return () => {
      socket.off(RATE_UPDATE_EVENT, handleRateUpdate);
      socket.off(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);
    };
  }, [socket, userId, updateRow]);

  useEffect(() => {
    if (!latestRow?.resetAt) return;

    const intervalId = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(intervalId);
  }, [latestRow?.resetAt]);

  const countdownValue = latestRow?.resetAt
    ? formatCountdown(latestRow.resetAt)
    : "--";

  if (!latestRow) {
    return {
      statItems: [
        { label: "Remaining", value: "--" },
        { label: "Resets in", value: "--" },
        { label: "Last reset", value: "--" },
        ...STATIC_STAT_ITEMS,
      ],
      status: null,
      currentRemaining: null,
      currentLimit: null,
      paused: false,
    };
  }

  const liveItems = buildLiveStatItems(latestRow);
  liveItems[1] = { ...liveItems[1], value: countdownValue };

  return {
    statItems: [...liveItems, ...STATIC_STAT_ITEMS],
    status: latestRow.status,
    currentRemaining: latestRow.remaining,
    currentLimit: latestRow.limit,
    paused: latestRow.paused,
  };
}

export { useUserDetailStats };
