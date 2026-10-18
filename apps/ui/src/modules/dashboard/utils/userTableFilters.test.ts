import { describe, it, expect } from "vitest";
import { buildUserStatusFilterOptions, applyUserTableFilters } from "./userTableFilters";
import { mockUserRow, mockWarningRow, mockExceededRow } from "../../../test/fixtures";
import type { UserRow } from "@ratly/core";

const rows: UserRow[] = [mockExceededRow, mockWarningRow, mockUserRow];

describe("buildUserStatusFilterOptions", () => {
  it("marks the active filter button", () => {
    const options = buildUserStatusFilterOptions(rows, "Warning");
    expect(options.find((o) => o.label === "Warning")?.active).toBe(true);
    expect(options.find((o) => o.label === "All")?.active).toBe(false);
    expect(options.find((o) => o.label === "OK")?.active).toBe(false);
    expect(options.find((o) => o.label === "Exceeded")?.active).toBe(false);
  });

  it("counts reflect full rows regardless of active filter", () => {
    const options = buildUserStatusFilterOptions(rows, "OK");
    expect(options.find((o) => o.label === "All")?.count).toBe(3);
    expect(options.find((o) => o.label === "OK")?.count).toBe(1);
    expect(options.find((o) => o.label === "Warning")?.count).toBe(1);
    expect(options.find((o) => o.label === "Exceeded")?.count).toBe(1);
  });
});

describe("applyUserTableFilters", () => {
  it("returns all rows when filters are at defaults", () => {
    const result = applyUserTableFilters(rows, {
      statusFilter: "All",
      searchQuery: "",
      windowFilter: "any",
    });
    expect(result).toEqual(rows);
  });

  it("filters by status", () => {
    const result = applyUserTableFilters(rows, {
      statusFilter: "OK",
      searchQuery: "",
      windowFilter: "any",
    });
    expect(result).toEqual([mockUserRow]);
  });

  it("filters by search query case-insensitively", () => {
    const result = applyUserTableFilters(rows, {
      statusFilter: "All",
      searchQuery: "USR_OK",
      windowFilter: "any",
    });
    expect(result).toEqual([mockUserRow]);
  });

  it("filters by 1h time window", () => {
    const NOW = Date.now();
    const recentRow: UserRow = { ...mockUserRow, userId: "usr_recent", lastRequestAt: NOW - 60_000 };
    const oldRow: UserRow = { ...mockUserRow, userId: "usr_old", lastRequestAt: NOW - 7_200_000 };

    const result = applyUserTableFilters([recentRow, oldRow], {
      statusFilter: "All",
      searchQuery: "",
      windowFilter: "1h",
    });

    expect(result).toEqual([recentRow]);
  });

  it("filters by 24h time window", () => {
    const NOW = Date.now();
    const recentRow: UserRow = { ...mockUserRow, userId: "usr_recent", lastRequestAt: NOW - 3_600_000 };
    const oldRow: UserRow = { ...mockUserRow, userId: "usr_old", lastRequestAt: NOW - 90_000_000 };

    const result = applyUserTableFilters([recentRow, oldRow], {
      statusFilter: "All",
      searchQuery: "",
      windowFilter: "24h",
    });

    expect(result).toEqual([recentRow]);
  });

  it("applies all filters in combination", () => {
    const NOW = Date.now();
    const match: UserRow = { ...mockWarningRow, userId: "usr_warn_recent", lastRequestAt: NOW - 60_000 };
    const wrongStatus: UserRow = { ...mockUserRow, userId: "usr_ok_recent", lastRequestAt: NOW - 60_000 };
    const wrongTime: UserRow = { ...mockWarningRow, userId: "usr_warn_old", lastRequestAt: NOW - 7_200_000 };

    const result = applyUserTableFilters([match, wrongStatus, wrongTime], {
      statusFilter: "Warning",
      searchQuery: "warn",
      windowFilter: "1h",
    });

    expect(result).toEqual([match]);
  });
});
