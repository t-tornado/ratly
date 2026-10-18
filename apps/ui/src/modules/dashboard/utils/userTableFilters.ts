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
  let okCount = 0;
  let warningCount = 0;
  let exceededCount = 0;

  for (const row of rows) {
    if (row.status === "ok") okCount++;
    else if (row.status === "warning") warningCount++;
    else if (row.status === "exceeded") exceededCount++;
  }

  return [
    { label: "All",      count: rows.length,   active: activeFilter === "All" },
    { label: "OK",       count: okCount,        active: activeFilter === "OK" },
    { label: "Warning",  count: warningCount,   active: activeFilter === "Warning",  color: "var(--color-warning)" },
    { label: "Exceeded", count: exceededCount,  active: activeFilter === "Exceeded", color: "var(--color-error)" },
  ];
}

export function applyUserTableFilters(
  rows: UserRow[],
  { statusFilter, searchQuery, windowFilter }: UserTableFilterState,
): UserRow[] {
  const hasStatusFilter = statusFilter !== "All";
  const hasSearchFilter = searchQuery !== "";
  const hasWindowFilter = windowFilter !== "any";

  if (!hasStatusFilter && !hasSearchFilter && !hasWindowFilter) return rows;

  const lowerQuery = hasSearchFilter ? searchQuery.toLowerCase() : "";
  const lowerStatus = hasStatusFilter ? statusFilter.toLowerCase() : "";
  const cutoff = hasWindowFilter
    ? Date.now() - (windowFilter === "1h" ? WINDOW_1H_MS : WINDOW_24H_MS)
    : 0;

  return rows.filter((row) => {
    if (hasStatusFilter && row.status !== lowerStatus) return false;
    if (hasSearchFilter && !row.userId.toLowerCase().includes(lowerQuery)) return false;
    if (hasWindowFilter && row.lastRequestAt < cutoff) return false;
    return true;
  });
}
