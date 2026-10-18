import { useState } from "react";
import type { UserRow } from "@ratly/core";
import { DEFAULT_LIMIT } from "@ratly/core";

import { ActionMenu } from "../../../../components/ActionMenu";
import { ResetWindowModal } from "../../../../components/ResetWindowModal";
import { AddExtraRequestsModal } from "../../../../components/AddExtraRequestsModal";
import { AdjustLimitModal } from "../../../../components/AdjustLimitModal";
import { ThrottlingModal } from "../../../../components/ThrottlingModal";
import { throttleDurationToSeconds } from "../../utils/throttlingUtils";
import type { ThrottlingDuration } from "../../utils/throttlingUtils";

type ActiveModal = "reset-window" | "add-extra" | "adjust-limit" | "throttling" | null;

interface DashboardActionMenuProps {
  row: UserRow;
  onResetWindow: () => Promise<unknown>;
  onAddExtra: (amount: number) => Promise<unknown>;
  onAdjustLimit: (limit: number) => Promise<unknown>;
  onResetLimit: () => Promise<unknown>;
  onPause: (seconds: number) => Promise<unknown>;
  onUnlock: () => Promise<unknown>;
  isResetWindowPending?: boolean;
  isAddExtraPending?: boolean;
  isAdjustLimitPending?: boolean;
  isThrottlingPending?: boolean;
}

function DashboardActionMenu({
  row,
  onResetWindow,
  onAddExtra,
  onAdjustLimit,
  onResetLimit,
  onPause,
  onUnlock,
  isResetWindowPending = false,
  isAddExtraPending = false,
  isAdjustLimitPending = false,
  isThrottlingPending = false,
}: DashboardActionMenuProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  function closeModal() {
    setActiveModal(null);
  }

  async function handleThrottlingConfirm(duration?: ThrottlingDuration) {
    try {
      if (duration !== undefined) {
        await onPause(throttleDurationToSeconds(duration));
      } else {
        await onUnlock();
      }
      closeModal();
    } catch {
      // modal stays open, toast shows error
    }
  }

  const menuItems = [
    {
      label: "Reset window",
      onClick: () => setActiveModal("reset-window"),
    },
    {
      label: "Add extra requests",
      onClick: () => setActiveModal("add-extra"),
    },
    {
      label: "Adjust limit",
      onClick: () => setActiveModal("adjust-limit"),
    },
    {
      label: "Reset to default",
      onClick: () => { onResetLimit().catch(() => {}); },
      hidden: row.limit === DEFAULT_LIMIT,
    },
    {
      label: row.paused ? "Pause throttling" : "Start throttling",
      onClick: () => setActiveModal("throttling"),
    },
  ];

  return (
    <>
      <ActionMenu
        items={menuItems}
        triggerLabel={`Admin actions for ${row.userId}`}
      />

      <ResetWindowModal
        isOpen={activeModal === "reset-window"}
        onClose={closeModal}
        onConfirm={async () => {
          try {
            await onResetWindow();
            closeModal();
          } catch {
            // modal stays open, toast shows error
          }
        }}
        userId={row.userId}
        currentRemaining={row.remaining}
        currentStatus={row.status}
        limit={row.limit}
        isLoading={isResetWindowPending}
      />

      <AddExtraRequestsModal
        isOpen={activeModal === "add-extra"}
        onClose={closeModal}
        onConfirm={async (amount) => {
          try {
            await onAddExtra(amount);
            closeModal();
          } catch {
            // modal stays open, toast shows error
          }
        }}
        userId={row.userId}
        currentRemaining={row.remaining}
        limit={row.limit}
        hasActiveWindow={row.resetAt !== null}
        isLoading={isAddExtraPending}
      />

      <AdjustLimitModal
        isOpen={activeModal === "adjust-limit"}
        onClose={closeModal}
        onConfirm={async (newLimit) => {
          try {
            await onAdjustLimit(newLimit);
            closeModal();
          } catch {
            // modal stays open, toast shows error
          }
        }}
        userId={row.userId}
        currentLimit={row.limit}
        currentRemaining={row.remaining}
        isLoading={isAdjustLimitPending}
      />

      <ThrottlingModal
        isOpen={activeModal === "throttling"}
        onClose={closeModal}
        onConfirm={handleThrottlingConfirm}
        userId={row.userId}
        isThrottling={row.paused}
        currentRemaining={row.remaining}
        isLoading={isThrottlingPending}
      />
    </>
  );
}

export { DashboardActionMenu, type DashboardActionMenuProps };
