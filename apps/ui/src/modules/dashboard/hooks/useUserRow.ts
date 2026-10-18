import { useCallback, useSyncExternalStore } from "react";
import type { UserRow } from "@ratly/core";
import type { RowEventStore } from "./useRowEventStore";

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
