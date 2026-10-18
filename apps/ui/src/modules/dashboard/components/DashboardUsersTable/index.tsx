import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserRow } from "@ratly/core";
import { FilterBar } from "../../../../components/FilterBar";
import { DataTable } from "../../../../components/DataTable";
import { mapUserRowToTableRow } from "../../../../lib/utils";
import { useDebouncedSearch } from "../../../../lib/hooks/useDebouncedSearch";
import { routes } from "../../../../routes";
import { applyUserTableFilters, buildUserStatusFilterOptions, USER_TABLE_TIME_OPTIONS } from "../../utils/userTableFilters";
import type { UserStatusFilter, TimeWindowFilter } from "../../types/userTableFilters";

interface DashboardUsersTableProps {
  rows: UserRow[];
  isLoading?: boolean;
}

function DashboardUsersTable({ rows, isLoading = false }: DashboardUsersTableProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("All");
  const [windowFilter, setWindowFilter] = useState<TimeWindowFilter>("any");
  const { searchQuery, onSearchChange } = useDebouncedSearch();

  const filteredRows = applyUserTableFilters(rows, { statusFilter, searchQuery, windowFilter });
  const statusFilterOptions = buildUserStatusFilterOptions(rows, statusFilter);

  return (
    <div data-testid="dashboard-users-table" className="flex flex-col flex-1 min-h-0 gap-3">
      <FilterBar
        filters={statusFilterOptions}
        selectLabel="Last active"
        selectOptions={USER_TABLE_TIME_OPTIONS}
        onFilterChange={(label) => setStatusFilter(label as UserStatusFilter)}
        onSearchChange={onSearchChange}
        onSelectChange={(val) => setWindowFilter(val as TimeWindowFilter)}
      />
      <DataTable
        className="flex-1 min-h-0"
        rows={filteredRows.map(mapUserRowToTableRow)}
        isLoading={isLoading}
        onRowClick={(userId) => navigate(routes.userDetail(userId))}
      />
    </div>
  );
}

export { DashboardUsersTable };
