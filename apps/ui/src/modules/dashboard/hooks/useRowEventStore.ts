import { useState, useEffect, useSyncExternalStore } from "react";
import type { Socket } from "socket.io-client";
import type { UserRow, RateUpdateEvent, RateLimitExceededEvent } from "@ratly/core";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";

import { createRowStore } from "../utils/rowStore";

interface RowEventStore {
  userIds: string[];
  subscribe: (userId: string, callback: (row: UserRow) => void) => void;
  unsubscribe: (userId: string) => void;
  getRow: (userId: string) => UserRow | undefined;
}

/**
 * Bridge between socket events and the dashboard table rows.
 *
 * Seeds {@link createRowStore} with REST-fetched rows, then pushes
 * every `rate:update` and `rate:limit_exceeded` socket event into
 * the store. The store fans out to per-row subscribers.
 *
 * ```
 * SocketProvider
 *   └─ useDashboardData ──→ initial rows (REST)
 *   └─ useRowEventStore ──→ live row patches (WebSocket)
 *        └─ createRowStore (pub/sub core)
 *             └─ useUserRow (per-row consumer)
 * ```
 *
 * @param socket - Shared Socket.IO instance from {@link SocketProvider}
 * @param initialRows - REST-fetched rows from {@link useDashboardData}
 * @listens socket "rate:update" — patches existing row or adds new user
 * @listens socket "rate:limit_exceeded" — patches row with exceeded state
 * @see createRowStore — the underlying pub/sub store
 * @see useUserRow — per-row reactive binding
 */
function useRowEventStore(socket: Socket, initialRows: UserRow[]): RowEventStore {
  const [store] = useState(() => createRowStore());

  useEffect(() => {
    store.initialize(initialRows);
  }, [store, initialRows]);

  useEffect(() => {
    const handleRateUpdate = ({ row }: RateUpdateEvent) => store.handleRowEvent(row);
    const handleLimitExceeded = ({ row }: RateLimitExceededEvent) => store.handleRowEvent(row);

    socket.on(RATE_UPDATE_EVENT, handleRateUpdate);
    socket.on(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);

    return () => {
      socket.off(RATE_UPDATE_EVENT, handleRateUpdate);
      socket.off(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);
    };
  }, [socket, store]);

  const userIds = useSyncExternalStore(store.subscribeStore, store.getUserIds);

  return {
    userIds,
    subscribe: store.subscribeRow,
    unsubscribe: store.unsubscribeRow,
    getRow: store.getRow,
  };
}

export { useRowEventStore };
export type { RowEventStore };
