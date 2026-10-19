import { describe, it, expect, vi } from "vitest";
import { createRowStore } from "./rowStore";
import { mockUserRow, mockWarningRow, mockExceededRow } from "../../../test/fixtures";
import type { UserRow } from "@ratly/core";

function flushMicrotasks() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

async function buildStore(rows: UserRow[] = []) {
  const store = createRowStore();
  if (rows.length > 0) {
    store.initialize(rows);
    await flushMicrotasks();
  }
  return store;
}

describe("createRowStore", () => {
  describe("initialize", () => {
    it("populates userIds from initial rows", async () => {
      const store = await buildStore([mockUserRow, mockWarningRow]);
      expect(store.getUserIds()).toEqual(["usr_ok", "usr_warning"]);
    });

    it("makes rows retrievable by userId", async () => {
      const store = await buildStore([mockUserRow]);
      expect(store.getRow("usr_ok")).toEqual(mockUserRow);
    });

    it("notifies store listeners on initialize via microtask", async () => {
      const store = createRowStore();
      const listener = vi.fn();
      store.subscribeStore(listener);

      store.initialize([mockUserRow]);
      expect(listener).not.toHaveBeenCalled();

      await flushMicrotasks();
      expect(listener).toHaveBeenCalledOnce();
    });

    it("clears previous data on re-initialize", async () => {
      const store = await buildStore([mockUserRow, mockWarningRow]);
      store.initialize([mockExceededRow]);

      expect(store.getUserIds()).toEqual(["usr_exceeded"]);
      expect(store.getRow("usr_ok")).toBeUndefined();
    });
  });

  describe("handleRowEvent", () => {
    it("appends new user to userIds and notifies store listeners via microtask", async () => {
      const store = await buildStore([mockUserRow]);
      const listener = vi.fn();
      store.subscribeStore(listener);

      store.handleRowEvent(mockWarningRow);

      expect(store.getUserIds()).toEqual(["usr_ok", "usr_warning"]);
      expect(listener).not.toHaveBeenCalled();

      await flushMicrotasks();
      expect(listener).toHaveBeenCalledOnce();
    });

    it("coalesces multiple new user notifications into one", async () => {
      const store = await buildStore([mockUserRow]);
      const listener = vi.fn();
      store.subscribeStore(listener);

      store.handleRowEvent(mockWarningRow);
      store.handleRowEvent(mockExceededRow);

      expect(store.getUserIds()).toEqual(["usr_ok", "usr_warning", "usr_exceeded"]);

      await flushMicrotasks();
      expect(listener).toHaveBeenCalledOnce();
    });

    it("updates existing row without notifying store listeners", async () => {
      const store = await buildStore([mockUserRow]);
      const storeListener = vi.fn();
      store.subscribeStore(storeListener);

      const updatedRow: UserRow = { ...mockUserRow, used: 99 };
      store.handleRowEvent(updatedRow);

      await flushMicrotasks();
      expect(storeListener).not.toHaveBeenCalled();
      expect(store.getRow("usr_ok")).toEqual(updatedRow);
    });

    it("notifies row subscriber for existing user update", async () => {
      const store = await buildStore([mockUserRow]);
      const rowCallback = vi.fn();
      store.subscribeRow("usr_ok", rowCallback);

      const updatedRow: UserRow = { ...mockUserRow, used: 50 };
      store.handleRowEvent(updatedRow);

      expect(rowCallback).toHaveBeenCalledWith(updatedRow);
    });

    it("does not notify row subscriber for new user", async () => {
      const store = await buildStore([mockUserRow]);
      const rowCallback = vi.fn();
      store.subscribeRow("usr_ok", rowCallback);

      store.handleRowEvent(mockWarningRow);

      expect(rowCallback).not.toHaveBeenCalled();
    });
  });

  describe("subscribeRow / unsubscribeRow", () => {
    it("stops notifying after unsubscribe", async () => {
      const store = await buildStore([mockUserRow]);
      const rowCallback = vi.fn();
      store.subscribeRow("usr_ok", rowCallback);
      store.unsubscribeRow("usr_ok");

      store.handleRowEvent({ ...mockUserRow, used: 77 });

      expect(rowCallback).not.toHaveBeenCalled();
    });
  });

  describe("subscribeStore", () => {
    it("returns unsubscribe function that removes listener", async () => {
      const store = createRowStore();
      const listener = vi.fn();
      const unsubscribe = store.subscribeStore(listener);

      unsubscribe();
      store.initialize([mockUserRow]);

      await flushMicrotasks();
      expect(listener).not.toHaveBeenCalled();
    });

    it("supports multiple listeners", async () => {
      const store = createRowStore();
      const listenerA = vi.fn();
      const listenerB = vi.fn();
      store.subscribeStore(listenerA);
      store.subscribeStore(listenerB);

      store.initialize([mockUserRow]);

      await flushMicrotasks();
      expect(listenerA).toHaveBeenCalledOnce();
      expect(listenerB).toHaveBeenCalledOnce();
    });
  });
});
