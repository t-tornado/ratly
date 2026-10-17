import { useCallback, useState } from "react";
import type { LiveEvent } from "../../../components/LiveEventsFeed";
import type { UserRow } from "@ratly/core";
import { toRateUpdateEvent, toLimitExceededEvent } from "../utils/eventTransformers";

const MAX_LIVE_EVENTS = 50;

function useLiveEvents() {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  const addRateUpdate = useCallback((row: UserRow) => {
    setLiveEvents((previous) => [toRateUpdateEvent(row), ...previous].slice(0, MAX_LIVE_EVENTS));
  }, []);

  const addLimitExceeded = useCallback((row: UserRow) => {
    setLiveEvents((previous) => [toLimitExceededEvent(row), ...previous].slice(0, MAX_LIVE_EVENTS));
  }, []);

  return { liveEvents, addRateUpdate, addLimitExceeded };
}

export { useLiveEvents };
