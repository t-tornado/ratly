import { useParams } from "react-router-dom";
import { UserDetailHeader } from "./components/UserDetailHeader";

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div data-testid="user-detail-page">
      <UserDetailHeader
        userId={userId ?? ""}
        status="status-ok"
        statusLabel="OK"
      />
      <main data-testid="user-detail-content" />
    </div>
  );
}
