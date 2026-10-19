import { useCallback, useEffect, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { RateUpdateEvent, RateLimitExceededEvent, UserRow } from "@ratly/core";

import { useSocket } from "../../../lib/hooks";
import { fetchUser, queryKeys } from "../../../lib/api";
import type { StatItem } from "../../../components/StatsRow";
import type { UserStatus } from "../types/userStats";
import { formatCountdown, buildLiveStatItems, EMPTY_STATS } from "../utils/userStats";

interface UserDetailStatsResult {
  statItems: StatItem[];
  status: UserStatus;
  currentRemaining: number | null;
  currentLimit: number | null;
  paused: boolean;
  hasActiveWindow: boolean;
  isError: boolean;
}

/**
 * Live rate-limit state for a single user's detail page.
 *
 * Fetches the user via REST, then patches the query cache on every
 * matching socket event. A 1s interval tick keeps the countdown
 * display current between events.
 *
 * Unlike the dashboard's {@link useRowEventStore} (which fans out
 * through a pub/sub store), this hook writes directly to the
 * React Query cache — simpler for a single-user view.
 *
 * @param userId - Target user
 * @returns Reactive stat items, status, and control flags
 * @listens socket "rate:update" — patches row if userId matches
 * @listens socket "rate:limit_exceeded" — patches row if userId matches
 * @see useUserDetailEvents — sibling hook for the event stream
 * @see buildLiveStatItems — pure formatter in utils/userStats
 */
function useUserDetailStats(userId: string): UserDetailStatsResult {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [, setTick] = useState(0);

  const { data: latestRow, isError } = useQuery({
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

  if (!latestRow) {
    return {
      statItems: EMPTY_STATS,
      status: null,
      currentRemaining: null,
      currentLimit: null,
      paused: false,
      hasActiveWindow: false,
      isError,
    };
  }

  const countdownValue = latestRow.resetAt
    ? formatCountdown(latestRow.resetAt)
    : "--";

  const liveItems = buildLiveStatItems(latestRow);
  liveItems[1] = { ...liveItems[1], value: countdownValue };

  return {
    statItems: liveItems,
    status: latestRow.status,
    currentRemaining: latestRow.remaining,
    currentLimit: latestRow.limit,
    paused: latestRow.paused,
    hasActiveWindow: latestRow.resetAt !== null,
    isError,
  };
}

export { useUserDetailStats };
