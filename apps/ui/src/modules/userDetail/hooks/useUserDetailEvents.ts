import { useEffect } from "react";

import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { RateUpdateEvent, RateLimitExceededEvent } from "@ratly/core";

import { useSocket } from "../../../lib/hooks";
import { mapRateUpdateToStreamEvent, mapLimitExceededToStreamEvent } from "../utils/eventStream";
import { useEventStreamStore } from "./useEventStreamStore";
import type { UserEventStream } from "./useEventStreamStore";

/**
 * Maps socket events into the persisted event stream for a user.
 *
 * Listens to the same events as {@link useUserDetailStats} but
 * serves a different purpose — converts raw {@link UserRow} payloads
 * into display-ready {@link StreamEvent} objects and pushes them
 * into the {@link useEventStreamStore} (Zustand, localStorage-persisted).
 *
 * @param userId - Filter events to this user only
 * @returns Current event stream (survives page refresh)
 * @listens socket "rate:update" — mapped via {@link mapRateUpdateToStreamEvent}
 * @listens socket "rate:limit_exceeded" — mapped via {@link mapLimitExceededToStreamEvent}
 * @see useUserDetailStats — sibling hook for stat display
 * @see useEventStreamStore — persistence layer
 */
function useUserDetailEvents(userId: string): UserEventStream {
  const { socket } = useSocket();
  const addEvent = useEventStreamStore((state) => state.addEvent);
  const stream = useEventStreamStore((state) => state.getStream(userId));

  useEffect(() => {
    const handleRateUpdate = ({ row }: RateUpdateEvent) => {
      if (row.userId !== userId) return;
      addEvent(userId, mapRateUpdateToStreamEvent(row));
    };

    const handleLimitExceeded = ({ row }: RateLimitExceededEvent) => {
      if (row.userId !== userId) return;
      addEvent(userId, mapLimitExceededToStreamEvent(row));
    };

    socket.on(RATE_UPDATE_EVENT, handleRateUpdate);
    socket.on(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);

    return () => {
      socket.off(RATE_UPDATE_EVENT, handleRateUpdate);
      socket.off(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);
    };
  }, [socket, userId, addEvent]);

  return stream;
}

export { useUserDetailEvents };
