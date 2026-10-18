import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import type { ActivityRange, RefreshOption } from "../types/activity";
import { DEFAULT_RANGE, DEFAULT_REFRESH, isValidRange, isValidRefresh } from "../utils/activityParams";

interface UseActivityParamsResult {
  range: ActivityRange;
  refresh: RefreshOption;
  setRange: (range: ActivityRange) => void;
  setRefresh: (refresh: RefreshOption) => void;
}

function useActivityParams(): UseActivityParamsResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawRange = searchParams.get("range");
  const rawRefresh = searchParams.get("refresh");

  const range = isValidRange(rawRange) ? rawRange : DEFAULT_RANGE;
  const refresh = isValidRefresh(rawRefresh) ? rawRefresh : DEFAULT_REFRESH;

  const setRange = useCallback(
    (nextRange: ActivityRange) => {
      setSearchParams((previous) => {
        const merged = new URLSearchParams(previous);
        merged.set("range", nextRange);
        return merged;
      });
    },
    [setSearchParams],
  );

  const setRefresh = useCallback(
    (nextRefresh: RefreshOption) => {
      setSearchParams((previous) => {
        const merged = new URLSearchParams(previous);
        merged.set("refresh", nextRefresh);
        return merged;
      });
    },
    [setSearchParams],
  );

  return { range, refresh, setRange, setRefresh };
}

export { useActivityParams };
export type { UseActivityParamsResult };
