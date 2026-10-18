import { useQuery } from "@tanstack/react-query";

import { fetchActivity, queryKeys } from "../../../lib/api";
import type { ActivityRange, ActivityBucket } from "../types/activity";

interface UseActivityDataOptions {
  userId: string;
  range: ActivityRange;
  refreshIntervalMs: number | false;
}

interface UseActivityDataResult {
  activityBuckets: ActivityBucket[];
  isLoading: boolean;
  isError: boolean;
}

function useActivityData({
  userId,
  range,
  refreshIntervalMs,
}: UseActivityDataOptions): UseActivityDataResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.activity(userId, range),
    queryFn: () => fetchActivity(userId, range),
    enabled: userId !== "",
    refetchInterval: refreshIntervalMs,
  });

  return {
    activityBuckets: data ?? [],
    isLoading,
    isError,
  };
}

export { useActivityData };
