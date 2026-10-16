import { useParams } from "react-router-dom";
import { PageSection } from "../../components/PageSection";
import { UserDetailHeader } from "./components/UserDetailHeader";
import { UserDetailContent } from "./components/UserDetailContent";

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div data-testid="user-detail-page" className="flex flex-col h-screen">
      <UserDetailHeader
        userId={userId ?? ""}
        status="status-ok"
        statusLabel="OK"
      />
      <PageSection className="flex-1 min-h-0 pb-5">
        <UserDetailContent />
      </PageSection>
    </div>
  );
}
