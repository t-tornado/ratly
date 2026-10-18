import { useState, useEffect, useSyncExternalStore } from "react";
import type { Socket } from "socket.io-client";
import type { UserRow, RateUpdateEvent, RateLimitExceededEvent } from "@ratly/core";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";

type RowSubscriber = (row: UserRow) => void;

interface RowEventStore {
  userIds: string[];
  subscribe: (userId: string, callback: RowSubscriber) => void;
  unsubscribe: (userId: string) => void;
  getRow: (userId: string) => UserRow | undefined;
}

function createRowStore() {
  const rowsMap = new Map<string, UserRow>();
  const rowSubscribers = new Map<string, RowSubscriber>();
  const storeListeners = new Set<() => void>();
  let currentUserIds: string[] = [];

  function notifyStoreChange() {
    for (const listener of storeListeners) listener();
  }

  return {
    initialize(rows: UserRow[]) {
      rowsMap.clear();
      for (const row of rows) rowsMap.set(row.userId, row);
      currentUserIds = rows.map((row) => row.userId);
      notifyStoreChange();
    },
    handleRowEvent(row: UserRow) {
      const isNewUser = !rowsMap.has(row.userId);
      rowsMap.set(row.userId, row);
      if (isNewUser) {
        currentUserIds = [row.userId, ...currentUserIds];
        notifyStoreChange();
      } else {
        rowSubscribers.get(row.userId)?.(row);
      }
    },
    getUserIds: () => currentUserIds,
    getRow: (userId: string) => rowsMap.get(userId),
    subscribeRow(userId: string, callback: RowSubscriber) {
      rowSubscribers.set(userId, callback);
    },
    unsubscribeRow(userId: string) {
      rowSubscribers.delete(userId);
    },
    subscribeStore(listener: () => void) {
      storeListeners.add(listener);
      return () => { storeListeners.delete(listener); };
    },
  };
}

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
