import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "../../components/PageLayout";
import { PageSection } from "../../components/PageSection";
import { UserDetailHeader } from "./components/UserDetailHeader";
import { UserDetailContent } from "./components/UserDetailContent";
import { useAdminActions } from "../dashboard/hooks/useAdminActions";
import type { ThrottlingDuration } from "../../components/ThrottlingModal";

const THROTTLE_DURATION_SECONDS: Record<ThrottlingDuration, number> = {
  "15m": 900,
  "1h": 3600,
  "24h": 86400,
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const safeUserId = userId ?? "";

  const {
    resetWindowMutation,
    adjustLimitMutation,
    addExtraMutation,
    pauseMutation,
    unlockMutation,
  } = useAdminActions();

  const handleResetWindow = useCallback(() => {
    resetWindowMutation.mutate(safeUserId);
  }, [resetWindowMutation, safeUserId]);

  const handleAdjustLimit = useCallback(
    (newLimit: number) => {
      adjustLimitMutation.mutate({ userId: safeUserId, limit: newLimit });
    },
    [adjustLimitMutation, safeUserId]
  );

  const handleAddExtraRequests = useCallback(
    (amount: number) => {
      addExtraMutation.mutate({ userId: safeUserId, amount });
    },
    [addExtraMutation, safeUserId]
  );

  const handleToggleThrottling = useCallback(
    (duration?: ThrottlingDuration) => {
      if (duration) {
        pauseMutation.mutate({
          userId: safeUserId,
          seconds: THROTTLE_DURATION_SECONDS[duration],
        });
      } else {
        unlockMutation.mutate(safeUserId);
      }
    },
    [pauseMutation, unlockMutation, safeUserId]
  );

  return (
    <PageLayout testId="user-detail-page">
      <UserDetailHeader
        userId={safeUserId}
        status="status-ok"
        statusLabel="OK"
        isThrottling={false}
        currentLimit={100}
        currentRemaining={42}
        onResetWindow={handleResetWindow}
        onAdjustLimit={handleAdjustLimit}
        onAddExtraRequests={handleAddExtraRequests}
        onToggleThrottling={handleToggleThrottling}
      />
      <PageSection className="flex-1 min-h-0 pb-5">
        <UserDetailContent />
      </PageSection>
    </PageLayout>
  );
}
