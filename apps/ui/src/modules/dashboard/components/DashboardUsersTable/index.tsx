import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserRow } from "@ratly/core";
import { FilterBar } from "../../../../components/FilterBar";
import { DataTable } from "../DataTable";
import { useDebouncedSearch } from "../../../../lib/hooks/useDebouncedSearch";
import { routes } from "../../../../routes";
import { applyUserTableFilters, buildUserStatusFilterOptions, USER_TABLE_TIME_OPTIONS } from "../../utils/userTableFilters";
import type { UserStatusFilter, TimeWindowFilter } from "../../types/userTableFilters";
import { useAdminActions } from "../../hooks/useAdminActions";
import { DashboardTableRow } from "./DashboardTableRow";
import type { RowEventStore } from "../../hooks/useRowEventStore";

interface DashboardUsersTableProps {
  store: RowEventStore;
  isLoading?: boolean;
}

function DashboardUsersTable({ store, isLoading = false }: DashboardUsersTableProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("All");
  const [windowFilter, setWindowFilter] = useState<TimeWindowFilter>("any");
  const { searchQuery, onSearchChange } = useDebouncedSearch();
  const adminActions = useAdminActions();

  const allRows = store.userIds
    .map((userId) => store.getRow(userId))
    .filter((row): row is UserRow => row !== undefined);

  const filteredRows = applyUserTableFilters(allRows, { statusFilter, searchQuery, windowFilter });
  const filteredUserIds = filteredRows.map((row) => row.userId);
  const statusFilterOptions = buildUserStatusFilterOptions(allRows, statusFilter);

  return (
    <div data-testid="dashboard-users-table" className="flex flex-col sm:flex-1 sm:min-h-0 gap-3">
      <div className="sticky top-14 z-10 sm:static bg-bg-base">
        <FilterBar
          filters={statusFilterOptions}
          selectLabel="Last active"
          selectOptions={USER_TABLE_TIME_OPTIONS}
          onFilterChange={(label) => setStatusFilter(label as UserStatusFilter)}
          onSearchChange={onSearchChange}
          onSelectChange={(val) => setWindowFilter(val as TimeWindowFilter)}
        />
      </div>
      <DataTable
        className="flex-1 min-h-0"
        userIds={filteredUserIds}
        isLoading={isLoading}
        renderRow={(userId) => (
          <DashboardTableRow
            key={userId}
            userId={userId}
            store={store}
            onRowClick={() => navigate(routes.userDetail(userId))}
            adminActions={adminActions}
          />
        )}
        footer={
          <span>{filteredUserIds.length} of {store.userIds.length} shown &middot; sorted by usage &darr;</span>
        }
      />
    </div>
  );
}

export { DashboardUsersTable };
