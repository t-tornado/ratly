import type { UserRow } from "@ratly/core";
import type { FilterOption } from "../../../components/FilterBar";
import type { UserStatusFilter, UserTableFilterState } from "../types/userTableFilters";

const WINDOW_1H_MS = 3_600_000;
const WINDOW_24H_MS = 86_400_000;

export const USER_TABLE_TIME_OPTIONS: { label: string; value: string }[] = [
  { label: "any time", value: "any" },
  { label: "1h", value: "1h" },
  { label: "24h", value: "24h" },
];

export function buildUserStatusFilterOptions(
  rows: UserRow[],
  activeFilter: UserStatusFilter,
): FilterOption[] {
  return [
    { label: "All", count: rows.length, active: activeFilter === "All" },
    { label: "OK", count: rows.filter((r) => r.status === "ok").length, active: activeFilter === "OK" },
    { label: "Warning", count: rows.filter((r) => r.status === "warning").length, active: activeFilter === "Warning", color: "var(--color-warning)" },
    { label: "Exceeded", count: rows.filter((r) => r.status === "exceeded").length, active: activeFilter === "Exceeded", color: "var(--color-error)" },
  ];
}

export function applyUserTableFilters(
  rows: UserRow[],
  { statusFilter, searchQuery, windowFilter }: UserTableFilterState,
): UserRow[] {
  let filtered = rows;

  if (statusFilter !== "All") {
    filtered = filtered.filter((row) => row.status === statusFilter.toLowerCase());
  }

  if (searchQuery !== "") {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter((row) => row.userId.toLowerCase().includes(lowerQuery));
  }

  if (windowFilter !== "any") {
    const windowMs = windowFilter === "1h" ? WINDOW_1H_MS : WINDOW_24H_MS;
    const cutoff = Date.now() - windowMs;
    filtered = filtered.filter((row) => row.lastRequestAt >= cutoff);
  }

  return filtered;
}
