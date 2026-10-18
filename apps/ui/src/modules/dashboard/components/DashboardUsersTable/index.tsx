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
import { useAdminActions } from "../../hooks/useAdminActions";
import { DashboardActionMenu } from "../DashboardActionMenu";

interface DashboardUsersTableProps {
  rows: UserRow[];
  isLoading?: boolean;
}

function DashboardUsersTable({ rows, isLoading = false }: DashboardUsersTableProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("All");
  const [windowFilter, setWindowFilter] = useState<TimeWindowFilter>("any");
  const { searchQuery, onSearchChange } = useDebouncedSearch();

  const {
    resetWindowMutation,
    adjustLimitMutation,
    resetLimitMutation,
    addExtraMutation,
    pauseMutation,
    unlockMutation,
  } = useAdminActions();

  const filteredRows = applyUserTableFilters(rows, { statusFilter, searchQuery, windowFilter });
  const statusFilterOptions = buildUserStatusFilterOptions(rows, statusFilter);

  function renderRowAction(userId: string) {
    const targetRow = rows.find((r) => r.userId === userId);
    if (!targetRow) return null;
    return (
      <DashboardActionMenu
        row={targetRow}
        onResetWindow={() => resetWindowMutation.mutate(userId)}
        onAddExtra={(amount) => addExtraMutation.mutate({ userId, amount })}
        onAdjustLimit={(limit) => adjustLimitMutation.mutate({ userId, limit })}
        onResetLimit={() => resetLimitMutation.mutate(userId)}
        onPause={(seconds) => pauseMutation.mutate({ userId, seconds })}
        onUnlock={() => unlockMutation.mutate(userId)}
      />
    );
  }

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
        renderAction={renderRowAction}
        footer={
          <span>{filteredRows.length} of {rows.length} shown &middot; sorted by usage &darr;</span>
        }
      />
    </div>
  );
}

export { DashboardUsersTable };
