import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserRow } from "@ratly/core";
import { FilterBar } from "../../../../components/FilterBar";
import type { FilterOption } from "../../../../components/FilterBar";
import { DataTable } from "../../../../components/DataTable";
import { mapUserRowToTableRow } from "../../../../lib/utils";
import { routes } from "../../../../routes";

const TIME_OPTIONS = [
  { label: "any time", value: "any" },
  { label: "1h", value: "1h" },
  { label: "24h", value: "24h" },
];

const WINDOW_MS_1H = 3_600_000;
const WINDOW_MS_24H = 86_400_000;

type StatusFilter = "All" | "OK" | "Warning" | "Exceeded";
type WindowFilter = "any" | "1h" | "24h";

interface DashboardUsersTableProps {
  rows: UserRow[];
  isLoading?: boolean;
}

function buildFilters(rows: UserRow[], activeStatus: StatusFilter): FilterOption[] {
  const total = rows.length;
  const okCount = rows.filter((r) => r.status === "ok").length;
  const warningCount = rows.filter((r) => r.status === "warning").length;
  const exceededCount = rows.filter((r) => r.status === "exceeded").length;

  return [
    { label: "All", count: total, active: activeStatus === "All" },
    { label: "OK", count: okCount, active: activeStatus === "OK" },
    { label: "Warning", count: warningCount, active: activeStatus === "Warning", color: "var(--color-warning)" },
    { label: "Exceeded", count: exceededCount, active: activeStatus === "Exceeded", color: "var(--color-error)" },
  ];
}

function deriveFilteredRows(
  rows: UserRow[],
  activeStatus: StatusFilter,
  searchQuery: string,
  activeWindow: WindowFilter,
): UserRow[] {
  let filtered = rows;

  if (activeStatus !== "All") {
    filtered = filtered.filter((row) => row.status === activeStatus.toLowerCase());
  }

  if (searchQuery !== "") {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter((row) => row.userId.toLowerCase().includes(lowerQuery));
  }

  if (activeWindow !== "any") {
    const windowMs = activeWindow === "1h" ? WINDOW_MS_1H : WINDOW_MS_24H;
    const cutoff = Date.now() - windowMs;
    filtered = filtered.filter((row) => row.lastRequestAt >= cutoff);
  }

  return filtered;
}

function DashboardUsersTable({ rows, isLoading = false }: DashboardUsersTableProps) {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWindow, setActiveWindow] = useState<WindowFilter>("any");

  const filteredRows = deriveFilteredRows(rows, activeStatus, searchQuery, activeWindow);
  const filters = buildFilters(rows, activeStatus);

  return (
    <div data-testid="dashboard-users-table" className="flex flex-col flex-1 min-h-0 gap-3">
      <FilterBar
        filters={filters}
        selectLabel="Last active"
        selectOptions={TIME_OPTIONS}
        onFilterChange={(label) => setActiveStatus(label as StatusFilter)}
        onSearchChange={(val) => setSearchQuery(val)}
        onSelectChange={(val) => setActiveWindow(val as WindowFilter)}
      />
      {isLoading ? (
        <div className="rounded-xl border border-border-default bg-bg-surface-raised p-8 text-center text-text-muted text-sm">
          Loading…
        </div>
      ) : (
        <DataTable
          className="flex-1 min-h-0"
          rows={filteredRows.map(mapUserRowToTableRow)}
          onRowClick={(userId) => navigate(routes.userDetail(userId))}
          footer={
            <span>{filteredRows.length} of {rows.length} shown &middot; sorted by usage &darr;</span>
          }
        />
      )}
    </div>
  );
}

export { DashboardUsersTable };
