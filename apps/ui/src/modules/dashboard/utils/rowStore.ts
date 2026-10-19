import type { UserRow } from "@ratly/core";

type RowSubscriber = (row: UserRow) => void;

/**
 * In-memory store for dashboard table rows — the pub/sub core.
 *
 * Holds the canonical row map and two subscriber tiers:
 * - **Row subscribers** — per-userId `setRow` callbacks for O(1) direct
 *   state updates (consumed by {@link useUserRow} via `useState`)
 * - **Store listeners** — coalesced microtask notification when the
 *   userId list changes (consumed by {@link useRowEventStore} via
 *   `useSyncExternalStore`)
 *
 * This design intentionally avoids `useSyncExternalStore` for per-row
 * updates. React's external store contract calls every subscriber's
 * `getSnapshot` on every notification — O(n) checks per event. With
 * 500+ mounted rows and 80 events/sec, that aggregate cost is
 * measurable. Direct `setRow` callbacks make it O(1): one event
 * resolves to one map lookup, one setState, one re-render.
 *
 * `useSyncExternalStore` is still used, but only for the userId list
 * — a value that changes rarely (new user joins, not every event).
 *
 * Flow: socket event → {@link useRowEventStore}.handleRowEvent
 * → `store.handleRowEvent` → O(1) map lookup → calls `setRow` for
 * that row only. New user → appends to list, schedules one notification.
 *
 * @see useRowEventStore — wires socket events into this store
 * @see useUserRow — registers its `setRow` as the per-row subscriber
 */
function createRowStore() {
  const rowsMap = new Map<string, UserRow>();
  const rowSubscribers = new Map<string, RowSubscriber>();
  const storeListeners = new Set<() => void>();
  let currentUserIds: string[] = [];
  let isNotificationPending = false;

  function notifyStoreChange() {
    for (const listener of storeListeners) listener();
  }

  /**
   * Coalesces rapid store notifications into one per microtask.
   *
   * Under heavy WebSocket load, many new users arrive within the same
   * event loop tick. Without coalescing, each fires `notifyStoreChange`
   * → `useSyncExternalStore` re-render → max update depth exceeded.
   *
   * @remarks Uses `queueMicrotask` so the notification fires after the
   * current synchronous burst but before the next paint.
   */
  function scheduleStoreNotification() {
    if (isNotificationPending) return;
    isNotificationPending = true;
    queueMicrotask(() => {
      isNotificationPending = false;
      notifyStoreChange();
    });
  }

  return {
    initialize(rows: UserRow[]) {
      rowsMap.clear();
      for (const row of rows) rowsMap.set(row.userId, row);
      currentUserIds = rows.map((row) => row.userId);
      scheduleStoreNotification();
    },
    handleRowEvent(row: UserRow) {
      const isNewUser = !rowsMap.has(row.userId);
      rowsMap.set(row.userId, row);
      if (isNewUser) {
        currentUserIds = [...currentUserIds, row.userId];
        scheduleStoreNotification();
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
