import type { UserRow } from "@ratly/core";
import { mapUserRowToTableRow } from "../../../../lib/utils";
import { useMediaQuery } from "../../../../lib/hooks/useMediaQuery";
import { routes } from "../../../../routes";
import { DataTableRow } from "../DataTable/DataTableRow";
import { DashboardActionMenu } from "../DashboardActionMenu";
import { useUserRow } from "../../hooks/useUserRow";
import type { RowEventStore } from "../../hooks/useRowEventStore";

const MOBILE_BREAKPOINT = "(max-width: 639px)";

interface AdminActions {
  resetWindowMutation: { mutateAsync: (userId: string) => Promise<unknown>; isPending: boolean };
  addExtraMutation: { mutateAsync: (params: { userId: string; amount: number }) => Promise<unknown>; isPending: boolean };
  adjustLimitMutation: { mutateAsync: (params: { userId: string; limit: number }) => Promise<unknown>; isPending: boolean };
  resetLimitMutation: { mutateAsync: (userId: string) => Promise<unknown>; isPending: boolean };
  pauseMutation: { mutateAsync: (params: { userId: string; seconds: number }) => Promise<unknown>; isPending: boolean };
  unlockMutation: { mutateAsync: (userId: string) => Promise<unknown>; isPending: boolean };
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
      href={routes.userDetail(userId)}
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
      onResetWindow={() => adminActions.resetWindowMutation.mutateAsync(userId)}
      onAddExtra={(amount) => adminActions.addExtraMutation.mutateAsync({ userId, amount })}
      onAdjustLimit={(limit) => adminActions.adjustLimitMutation.mutateAsync({ userId, limit })}
      onResetLimit={() => adminActions.resetLimitMutation.mutateAsync(userId)}
      onPause={(seconds) => adminActions.pauseMutation.mutateAsync({ userId, seconds })}
      onUnlock={() => adminActions.unlockMutation.mutateAsync(userId)}
      isResetWindowPending={adminActions.resetWindowMutation.isPending}
      isAddExtraPending={adminActions.addExtraMutation.isPending}
      isAdjustLimitPending={adminActions.adjustLimitMutation.isPending}
      isThrottlingPending={adminActions.pauseMutation.isPending || adminActions.unlockMutation.isPending}
    />
  );
}

export { DashboardTableRow };
export type { AdminActions };
