import { useEffect, useState } from "react";

import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { RateUpdateEvent, RateLimitExceededEvent, UserRow } from "@ratly/core";

import { useSocket } from "../../../lib/hooks";
import type { StreamEvent } from "../../../components/EventStream";

function formatEventTimestamp(): string {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function buildEventDescription(row: UserRow): string {
  return `remaining ${row.remaining} / ${row.allowedTotal} · resets ${row.resetAt ? new Date(row.resetAt).toLocaleTimeString("en-GB", { hour12: false }) : "--"}`;
}

function mapRateUpdateToStreamEvent(row: UserRow): StreamEvent {
  return {
    type: RATE_UPDATE_EVENT,
    timestamp: formatEventTimestamp(),
    description: buildEventDescription(row),
    severity: "info",
  };
}

function mapLimitExceededToStreamEvent(row: UserRow): StreamEvent {
  return {
    type: RATE_LIMIT_EXCEEDED_EVENT,
    timestamp: formatEventTimestamp(),
    description: `blocked · retry at ${row.resetAt ? new Date(row.resetAt).toLocaleTimeString("en-GB", { hour12: false }) : "--"}`,
    severity: "error",
  };
}

function useUserDetailEvents(userId: string): StreamEvent[] {
  const { socket } = useSocket();
  const [events, setEvents] = useState<StreamEvent[]>([]);

  useEffect(() => {
    const handleRateUpdate = ({ row }: RateUpdateEvent) => {
      if (row.userId !== userId) return;
      setEvents((previous) => [mapRateUpdateToStreamEvent(row), ...previous]);
    };

    const handleLimitExceeded = ({ row }: RateLimitExceededEvent) => {
      if (row.userId !== userId) return;
      setEvents((previous) => [mapLimitExceededToStreamEvent(row), ...previous]);
    };

    socket.on(RATE_UPDATE_EVENT, handleRateUpdate);
    socket.on(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);

    return () => {
      socket.off(RATE_UPDATE_EVENT, handleRateUpdate);
      socket.off(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);
    };
  }, [socket, userId]);

  return events;
}

export { useUserDetailEvents };
