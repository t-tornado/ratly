import { useParams } from "react-router-dom";
import { PageLayout } from "../../components/PageLayout";
import { PageSection } from "../../components/PageSection";
import { UserDetailHeader } from "./components/UserDetailHeader";
import { UserDetailContent } from "./components/UserDetailContent";

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <PageLayout testId="user-detail-page">
      <UserDetailHeader
        userId={userId ?? ""}
        status="status-ok"
        statusLabel="OK"
        isThrottling={false}
        currentLimit={100}
        currentRemaining={42}
      />
      <PageSection className="flex-1 min-h-0 pb-5">
        <UserDetailContent />
      </PageSection>
    </PageLayout>
  );
}
