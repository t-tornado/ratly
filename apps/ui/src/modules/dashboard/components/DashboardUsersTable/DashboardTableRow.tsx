import type { UserRow } from "@ratly/core";
import { mapUserRowToTableRow } from "../../../../lib/utils";
import { useMediaQuery } from "../../../../lib/hooks/useMediaQuery";
import { DataTableRow } from "../DataTable/DataTableRow";
import { DashboardActionMenu } from "../DashboardActionMenu";
import { useUserRow } from "../../hooks/useUserRow";
import type { RowEventStore } from "../../hooks/useRowEventStore";

const MOBILE_BREAKPOINT = "(max-width: 639px)";

interface AdminActions {
  resetWindowMutation: { mutate: (userId: string) => void };
  addExtraMutation: { mutate: (params: { userId: string; amount: number }) => void };
  adjustLimitMutation: { mutate: (params: { userId: string; limit: number }) => void };
  resetLimitMutation: { mutate: (userId: string) => void };
  pauseMutation: { mutate: (params: { userId: string; seconds: number }) => void };
  unlockMutation: { mutate: (userId: string) => void };
}

interface DashboardTableRowProps {
  userId: string;
  store: RowEventStore;
  onRowClick: () => void;
  adminActions: AdminActions;
}

function DashboardTableRow({ userId, store, onRowClick, adminActions }: DashboardTableRowProps) {
  const row = useUserRow(userId, store);
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  if (!row) return null;

  const tableRow = mapUserRowToTableRow(row);

  return (
    <DataTableRow
      {...tableRow}
      variant={isMobile ? "card" : "table"}
      isClickable
      onClick={onRowClick}
      actionContent={renderActionMenu(row, userId, adminActions)}
    />
  );
}

function renderActionMenu(row: UserRow, userId: string, adminActions: AdminActions) {
  return (
    <DashboardActionMenu
      row={row}
      onResetWindow={() => adminActions.resetWindowMutation.mutate(userId)}
      onAddExtra={(amount) => adminActions.addExtraMutation.mutate({ userId, amount })}
      onAdjustLimit={(limit) => adminActions.adjustLimitMutation.mutate({ userId, limit })}
      onResetLimit={() => adminActions.resetLimitMutation.mutate(userId)}
      onPause={(seconds) => adminActions.pauseMutation.mutate({ userId, seconds })}
      onUnlock={() => adminActions.unlockMutation.mutate(userId)}
    />
  );
}

export { DashboardTableRow };
export type { AdminActions };
