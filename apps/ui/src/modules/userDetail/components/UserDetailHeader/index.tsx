import { useState } from "react";
import { Link } from "react-router-dom";

import { routes } from "../../../../routes";
import { PageHeader } from "../../../../components/PageHeader";
import { Badge, type BadgeProps } from "../../../../components/Badge";
import { Button } from "../../../../components/Button";
import { StatusDot } from "../../../../components/StatusDot";
import { ResetWindowModal } from "../../../../components/ResetWindowModal";
import { AdjustLimitModal } from "../../../../components/AdjustLimitModal";
import { AddExtraRequestsModal } from "../../../../components/AddExtraRequestsModal";
import {
  ThrottlingModal,
  type ThrottlingDuration,
} from "../../../../components/ThrottlingModal";

interface UserDetailHeaderProps {
  userId: string;
  status: BadgeProps["variant"];
  statusLabel: string;
  isStreaming?: boolean;
  isThrottling: boolean;
  currentLimit: number;
  currentRemaining: number;
  onResetWindow?: () => void;
  onAdjustLimit?: (newLimit: number) => void;
  onAddExtraRequests?: (extraRequests: number) => void;
  onToggleThrottling?: (duration?: ThrottlingDuration) => void;
}

type ModalName =
  | "resetWindow"
  | "adjustLimit"
  | "addExtraRequests"
  | "throttling"
  | null;

function UserDetailHeader({
  userId,
  status,
  statusLabel,
  isStreaming = false,
  isThrottling,
  currentLimit,
  currentRemaining,
  onResetWindow,
  onAdjustLimit,
  onAddExtraRequests,
  onToggleThrottling,
}: UserDetailHeaderProps) {
  const [activeModal, setActiveModal] = useState<ModalName>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div data-testid="user-detail-header">
      <PageHeader
        rightSlot={
          <div
            data-testid="admin-actions"
            role="group"
            aria-label="Admin actions"
            className="flex flex-wrap gap-2"
          >
            <Button
              variant="ghost"
              onClick={() => setActiveModal("resetWindow")}
            >
              Reset window
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveModal("adjustLimit")}
            >
              Adjust limit
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveModal("addExtraRequests")}
            >
              Add extra requests
            </Button>
            <Button
              variant={isThrottling ? "primary" : "ghost"}
              onClick={() => setActiveModal("throttling")}
            >
              {isThrottling ? "Pause Throttling" : "Start Throttling"}
            </Button>
          </div>
        }
      >
        <Link
          to={routes.dashboard}
          className="no-underline text-text-secondary text-base-sm"
        >
          ← Users
        </Link>
        <h1
          data-testid="user-id"
          className="m-0 font-mono text-3xl font-semibold"
        >
          {userId}
        </h1>
        <Badge variant={status}>{statusLabel}</Badge>
        {isStreaming && (
          <span className="font-mono text-sm text-success-text flex items-center gap-1.5">
            <StatusDot variant="live" pulsating />
            streaming
          </span>
        )}
      </PageHeader>

      <ResetWindowModal
        isOpen={activeModal === "resetWindow"}
        onClose={closeModal}
        onConfirm={() => {
          onResetWindow?.();
          closeModal();
        }}
        userId={userId}
        currentRemaining={currentRemaining}
        currentStatus={statusLabel}
        limit={currentLimit}
      />

      <AdjustLimitModal
        isOpen={activeModal === "adjustLimit"}
        onClose={closeModal}
        onConfirm={(newLimit) => {
          onAdjustLimit?.(newLimit);
          closeModal();
        }}
        userId={userId}
        currentLimit={currentLimit}
        currentRemaining={currentRemaining}
      />

      <AddExtraRequestsModal
        isOpen={activeModal === "addExtraRequests"}
        onClose={closeModal}
        onConfirm={(extraRequests) => {
          onAddExtraRequests?.(extraRequests);
          closeModal();
        }}
        userId={userId}
        currentRemaining={currentRemaining}
        limit={currentLimit}
      />

      <ThrottlingModal
        isOpen={activeModal === "throttling"}
        onClose={closeModal}
        onConfirm={(duration) => {
          onToggleThrottling?.(duration);
          closeModal();
        }}
        userId={userId}
        isThrottling={isThrottling}
        currentRemaining={currentRemaining}
      />
    </div>
  );
}

export { UserDetailHeader, type UserDetailHeaderProps };
