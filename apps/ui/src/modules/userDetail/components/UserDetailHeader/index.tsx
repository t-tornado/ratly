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
  onResetWindow?: () => Promise<unknown>;
  onAdjustLimit?: (newLimit: number) => Promise<unknown>;
  onAddExtraRequests?: (extraRequests: number) => Promise<unknown>;
  onToggleThrottling?: (duration?: ThrottlingDuration) => Promise<unknown>;
  isResetWindowPending?: boolean;
  isAdjustLimitPending?: boolean;
  isAddExtraPending?: boolean;
  isThrottlingPending?: boolean;
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
  isResetWindowPending = false,
  isAdjustLimitPending = false,
  isAddExtraPending = false,
  isThrottlingPending = false,
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
            className="hidden md:flex flex-wrap gap-2"
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
        onConfirm={async () => {
          try {
            await onResetWindow?.();
            closeModal();
          } catch {
            // modal stays open, toast shows error
          }
        }}
        userId={userId}
        currentRemaining={currentRemaining}
        currentStatus={statusLabel}
        limit={currentLimit}
        isLoading={isResetWindowPending}
      />

      <AdjustLimitModal
        isOpen={activeModal === "adjustLimit"}
        onClose={closeModal}
        onConfirm={async (newLimit) => {
          try {
            await onAdjustLimit?.(newLimit);
            closeModal();
          } catch {
            // modal stays open, toast shows error
          }
        }}
        userId={userId}
        currentLimit={currentLimit}
        currentRemaining={currentRemaining}
        isLoading={isAdjustLimitPending}
      />

      <AddExtraRequestsModal
        isOpen={activeModal === "addExtraRequests"}
        onClose={closeModal}
        onConfirm={async (extraRequests) => {
          try {
            await onAddExtraRequests?.(extraRequests);
            closeModal();
          } catch {
            // modal stays open, toast shows error
          }
        }}
        userId={userId}
        currentRemaining={currentRemaining}
        limit={currentLimit}
        isLoading={isAddExtraPending}
      />

      <ThrottlingModal
        isOpen={activeModal === "throttling"}
        onClose={closeModal}
        onConfirm={async (duration) => {
          try {
            await onToggleThrottling?.(duration);
            closeModal();
          } catch {
            // modal stays open, toast shows error
          }
        }}
        userId={userId}
        isThrottling={isThrottling}
        currentRemaining={currentRemaining}
        isLoading={isThrottlingPending}
      />
    </div>
  );
}

export { UserDetailHeader, type UserDetailHeaderProps };
