import { useCallback } from "react";
import { useParams } from "react-router-dom";

import { PageLayout } from "../../components/PageLayout";
import { PageSection } from "../../components/PageSection";
import { useSocket } from "../../lib/hooks";
import type { BadgeProps } from "../../components/Badge";

import { UserDetailHeader } from "./components/UserDetailHeader";
import { UserDetailContent } from "./components/UserDetailContent";
import { useAdminActions } from "../dashboard/hooks/useAdminActions";
import { useUserDetailStats } from "./hooks/useUserDetailStats";
import type { ThrottlingDuration } from "../../components/ThrottlingModal";

const THROTTLE_DURATION_SECONDS: Record<ThrottlingDuration, number> = {
  "15m": 900,
  "1h": 3600,
  "24h": 86400,
};

const STATUS_TO_BADGE_VARIANT: Record<string, BadgeProps["variant"]> = {
  ok: "status-ok",
  warning: "status-warning",
  exceeded: "status-exceeded",
};

const STATUS_TO_LABEL: Record<string, string> = {
  ok: "OK",
  warning: "Warning",
  exceeded: "Exceeded",
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const safeUserId = userId ?? "";

  const { isConnected } = useSocket();
  const { status, currentRemaining, currentLimit, paused, hasActiveWindow } =
    useUserDetailStats(safeUserId);

  const {
    resetWindowMutation,
    adjustLimitMutation,
    addExtraMutation,
    pauseMutation,
    unlockMutation,
  } = useAdminActions();

  const handleResetWindow = useCallback(
    () => resetWindowMutation.mutateAsync(safeUserId),
    [resetWindowMutation, safeUserId],
  );

  const handleAdjustLimit = useCallback(
    (newLimit: number) =>
      adjustLimitMutation.mutateAsync({ userId: safeUserId, limit: newLimit }),
    [adjustLimitMutation, safeUserId],
  );

  const handleAddExtraRequests = useCallback(
    (amount: number) =>
      addExtraMutation.mutateAsync({ userId: safeUserId, amount }),
    [addExtraMutation, safeUserId],
  );

  const handleToggleThrottling = useCallback(
    (duration?: ThrottlingDuration) => {
      if (duration) {
        return pauseMutation.mutateAsync({
          userId: safeUserId,
          seconds: THROTTLE_DURATION_SECONDS[duration],
        });
      }
      return unlockMutation.mutateAsync(safeUserId);
    },
    [pauseMutation, unlockMutation, safeUserId],
  );

  const badgeVariant = status
    ? STATUS_TO_BADGE_VARIANT[status] ?? "status-ok"
    : "status-ok";
  const statusLabel = status ? STATUS_TO_LABEL[status] ?? "OK" : "OK";

  return (
    <PageLayout testId="user-detail-page">
      <UserDetailHeader
        userId={safeUserId}
        status={badgeVariant}
        statusLabel={statusLabel}
        isStreaming={isConnected}
        isThrottling={!paused}
        currentLimit={currentLimit ?? 0}
        currentRemaining={currentRemaining ?? 0}
        onResetWindow={handleResetWindow}
        onAdjustLimit={handleAdjustLimit}
        hasActiveWindow={hasActiveWindow}
        onAddExtraRequests={handleAddExtraRequests}
        onToggleThrottling={handleToggleThrottling}
        isResetWindowPending={resetWindowMutation.isPending}
        isAdjustLimitPending={adjustLimitMutation.isPending}
        isAddExtraPending={addExtraMutation.isPending}
        isThrottlingPending={pauseMutation.isPending || unlockMutation.isPending}
      />
      <PageSection className="flex-1 min-h-0 pb-5">
        <UserDetailContent userId={safeUserId} />
      </PageSection>
    </PageLayout>
  );
}
