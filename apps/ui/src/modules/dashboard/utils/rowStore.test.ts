import { describe, it, expect, vi } from "vitest";
import { createRowStore } from "./rowStore";
import { mockUserRow, mockWarningRow, mockExceededRow } from "../../../test/fixtures";
import type { UserRow } from "@ratly/core";

function buildStore(rows: UserRow[] = []) {
  const store = createRowStore();
  if (rows.length > 0) store.initialize(rows);
  return store;
}

describe("createRowStore", () => {
  describe("initialize", () => {
    it("populates userIds from initial rows", () => {
      const store = buildStore([mockUserRow, mockWarningRow]);
      expect(store.getUserIds()).toEqual(["usr_ok", "usr_warning"]);
    });

    it("makes rows retrievable by userId", () => {
      const store = buildStore([mockUserRow]);
      expect(store.getRow("usr_ok")).toEqual(mockUserRow);
    });

    it("notifies store listeners on initialize", () => {
      const store = createRowStore();
      const listener = vi.fn();
      store.subscribeStore(listener);

      store.initialize([mockUserRow]);

      expect(listener).toHaveBeenCalledOnce();
    });

    it("clears previous data on re-initialize", () => {
      const store = buildStore([mockUserRow, mockWarningRow]);
      store.initialize([mockExceededRow]);

      expect(store.getUserIds()).toEqual(["usr_exceeded"]);
      expect(store.getRow("usr_ok")).toBeUndefined();
    });
  });

  describe("handleRowEvent", () => {
    it("prepends new user to userIds and notifies store listeners", () => {
      const store = buildStore([mockUserRow]);
      const listener = vi.fn();
      store.subscribeStore(listener);

      store.handleRowEvent(mockWarningRow);

      expect(store.getUserIds()).toEqual(["usr_warning", "usr_ok"]);
      expect(listener).toHaveBeenCalledOnce();
    });

    it("updates existing row without notifying store listeners", () => {
      const store = buildStore([mockUserRow]);
      const storeListener = vi.fn();
      store.subscribeStore(storeListener);

      const updatedRow: UserRow = { ...mockUserRow, used: 99 };
      store.handleRowEvent(updatedRow);

      expect(storeListener).not.toHaveBeenCalled();
      expect(store.getRow("usr_ok")).toEqual(updatedRow);
    });

    it("notifies row subscriber for existing user update", () => {
      const store = buildStore([mockUserRow]);
      const rowCallback = vi.fn();
      store.subscribeRow("usr_ok", rowCallback);

      const updatedRow: UserRow = { ...mockUserRow, used: 50 };
      store.handleRowEvent(updatedRow);

      expect(rowCallback).toHaveBeenCalledWith(updatedRow);
    });

    it("does not notify row subscriber for new user", () => {
      const store = buildStore([mockUserRow]);
      const rowCallback = vi.fn();
      store.subscribeRow("usr_ok", rowCallback);

      store.handleRowEvent(mockWarningRow);

      expect(rowCallback).not.toHaveBeenCalled();
    });
  });

  describe("subscribeRow / unsubscribeRow", () => {
    it("stops notifying after unsubscribe", () => {
      const store = buildStore([mockUserRow]);
      const rowCallback = vi.fn();
      store.subscribeRow("usr_ok", rowCallback);
      store.unsubscribeRow("usr_ok");

      store.handleRowEvent({ ...mockUserRow, used: 77 });

      expect(rowCallback).not.toHaveBeenCalled();
    });
  });

  describe("subscribeStore", () => {
    it("returns unsubscribe function that removes listener", () => {
      const store = createRowStore();
      const listener = vi.fn();
      const unsubscribe = store.subscribeStore(listener);

      unsubscribe();
      store.initialize([mockUserRow]);

      expect(listener).not.toHaveBeenCalled();
    });

    it("supports multiple listeners", () => {
      const store = createRowStore();
      const listenerA = vi.fn();
      const listenerB = vi.fn();
      store.subscribeStore(listenerA);
      store.subscribeStore(listenerB);

      store.initialize([mockUserRow]);

      expect(listenerA).toHaveBeenCalledOnce();
      expect(listenerB).toHaveBeenCalledOnce();
    });
  });
});
