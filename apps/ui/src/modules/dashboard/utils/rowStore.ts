import type { UserRow } from "@ratly/core";

type RowSubscriber = (row: UserRow) => void;

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

type RowStore = ReturnType<typeof createRowStore>;

export { createRowStore };
export type { RowSubscriber, RowStore };
