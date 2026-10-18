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
  onClose: () => void;
  onResetWindow: () => void;
  onAddExtra: (amount: number) => void;
  onAdjustLimit: (limit: number) => void;
  onResetLimit: () => void;
  onPause: (seconds: number) => void;
  onUnlock: () => void;
}

function DashboardActionMenu({
  row,
  onClose,
  onResetWindow,
  onAddExtra,
  onAdjustLimit,
  onResetLimit,
  onPause,
  onUnlock,
}: DashboardActionMenuProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  function closeModal() {
    setActiveModal(null);
    onClose();
  }

  function handleThrottlingConfirm(duration?: ThrottlingDuration) {
    if (duration !== undefined) {
      onPause(throttleDurationToSeconds(duration));
    } else {
      onUnlock();
    }
    closeModal();
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
      onClick: () => {
        onResetLimit();
        onClose();
      },
      hidden: row.limit === DEFAULT_LIMIT,
    },
    {
      label: row.paused ? "Resume throttling" : "Pause throttling",
      onClick: () => setActiveModal("throttling"),
    },
  ];

  return (
    <>
      <ActionMenu
        items={menuItems}
        triggerLabel={`Admin actions for ${row.userId}`}
        defaultOpen
        onOpenChange={(isOpen) => { if (!isOpen && activeModal === null) onClose(); }}
      />

      <ResetWindowModal
        isOpen={activeModal === "reset-window"}
        onClose={closeModal}
        onConfirm={() => {
          onResetWindow();
          closeModal();
        }}
        userId={row.userId}
        currentRemaining={row.remaining}
        currentStatus={row.status}
        limit={row.limit}
      />

      <AddExtraRequestsModal
        isOpen={activeModal === "add-extra"}
        onClose={closeModal}
        onConfirm={(amount) => {
          onAddExtra(amount);
          closeModal();
        }}
        userId={row.userId}
        currentRemaining={row.remaining}
        limit={row.limit}
      />

      <AdjustLimitModal
        isOpen={activeModal === "adjust-limit"}
        onClose={closeModal}
        onConfirm={(newLimit) => {
          onAdjustLimit(newLimit);
          closeModal();
        }}
        userId={row.userId}
        currentLimit={row.limit}
        currentRemaining={row.remaining}
      />

      <ThrottlingModal
        isOpen={activeModal === "throttling"}
        onClose={closeModal}
        onConfirm={handleThrottlingConfirm}
        userId={row.userId}
        isThrottling={!row.paused}
        currentRemaining={row.remaining}
      />
    </>
  );
}

export { DashboardActionMenu, type DashboardActionMenuProps };
