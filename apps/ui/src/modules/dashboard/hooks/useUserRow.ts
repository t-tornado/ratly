import { useState, useEffect } from "react";
import type { UserRow } from "@ratly/core";
import type { RowEventStore } from "./useRowEventStore";

/**
 * Reactive binding for a single table row via direct setState subscription.
 *
 * Registers this row's `setRow` in the {@link createRowStore} subscriber
 * map. When a socket event arrives for this userId, the store does an
 * O(1) map lookup and calls `setRow` directly — only this row re-renders.
 *
 * Uses `useState` + direct callback instead of `useSyncExternalStore`.
 * With `useSyncExternalStore`, React calls every subscriber's `getSnapshot`
 * on every store notification to check for changes — O(n) across all
 * mounted rows per event. The direct `setRow` pattern skips that: the
 * store already knows which row changed from the event payload, so it
 * calls exactly one setter. O(1) per event regardless of row count.
 *
 * @param userId - Row to subscribe to
 * @param store - Store instance from {@link useRowEventStore}
 * @returns Current row state, undefined if not yet loaded
 * @see useRowEventStore — provides the store
 * @see createRowStore — owns the subscriber map
 */
function useUserRow(userId: string, store: RowEventStore): UserRow | undefined {
  const [row, setRow] = useState<UserRow | undefined>(() => store.getRow(userId));

  useEffect(() => {
    store.subscribe(userId, setRow);
    return () => store.unsubscribe(userId);
  }, [userId, store]);

  return row;
}

export { useUserRow };
