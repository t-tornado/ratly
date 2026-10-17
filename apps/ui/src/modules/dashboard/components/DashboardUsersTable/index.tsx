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

interface DashboardUsersTableProps {
  rows: UserRow[];
  isLoading?: boolean;
}

function buildFilters(rows: UserRow[]): FilterOption[] {
  const total = rows.length;
  const okCount = rows.filter((r) => r.status === "ok").length;
  const warningCount = rows.filter((r) => r.status === "warning").length;
  const exceededCount = rows.filter((r) => r.status === "exceeded").length;

  return [
    { label: "All", count: total, active: true },
    { label: "OK", count: okCount },
    { label: "Warning", count: warningCount, color: "var(--color-warning)" },
    { label: "Exceeded", count: exceededCount, color: "var(--color-error)" },
  ];
}

function DashboardUsersTable({ rows, isLoading = false }: DashboardUsersTableProps) {
  const navigate = useNavigate();
  const tableRows = rows.map(mapUserRowToTableRow);
  const filters = buildFilters(rows);

  return (
    <div data-testid="dashboard-users-table" className="flex flex-col flex-1 min-h-0 gap-3">
      <FilterBar
        filters={filters}
        selectLabel="Last active"
        selectOptions={TIME_OPTIONS}
      />
      {isLoading ? (
        <div className="rounded-xl border border-border-default bg-bg-surface-raised p-8 text-center text-text-muted text-sm">
          Loading…
        </div>
      ) : (
        <DataTable
          className="flex-1 min-h-0"
          rows={tableRows}
          onRowClick={(userId) => navigate(routes.userDetail(userId))}
          footer={
            <span>{tableRows.length} of {tableRows.length} shown &middot; sorted by usage &darr;</span>
          }
        />
      )}
    </div>
  );
}

export { DashboardUsersTable };
