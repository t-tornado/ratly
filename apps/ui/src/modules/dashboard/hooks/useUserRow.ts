import { useCallback, useSyncExternalStore } from "react";
import type { UserRow } from "@ratly/core";
import type { RowEventStore } from "./useRowEventStore";

/**
 * Reactive binding for a single table row.
 *
 * Subscribes to one userId in the {@link createRowStore} via
 * `useSyncExternalStore` — re-renders only when this specific
 * row changes, not on every socket event. This is what makes
 * the table performant with hundreds of rows.
 *
 * @param userId - Row to subscribe to
 * @param store - Store instance from {@link useRowEventStore}
 * @returns Current row state, undefined if not yet loaded
 * @see useRowEventStore — provides the store
 * @see createRowStore — owns the subscriber map
 */
function useUserRow(userId: string, store: RowEventStore): UserRow | undefined {
  const subscribeToRow = useCallback(
    (onStoreChange: () => void) => {
      store.subscribe(userId, () => onStoreChange());
      return () => store.unsubscribe(userId);
    },
    [userId, store],
  );

  const getRowSnapshot = useCallback(
    () => store.getRow(userId),
    [userId, store],
  );

  return useSyncExternalStore(subscribeToRow, getRowSnapshot);
}

export { useUserRow };
