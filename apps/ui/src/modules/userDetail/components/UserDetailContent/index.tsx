import { UserDetailStats } from "../UserDetailStats";
import { UserDetailActivity } from "../UserDetailActivity";
import { UserDetailEvents } from "../UserDetailEvents";

interface UserDetailContentProps {
  userId: string;
}

function UserDetailContent({ userId }: UserDetailContentProps) {
  return (
    <div data-testid="user-detail-content" className="flex flex-col gap-5">
      <UserDetailStats userId={userId} />
      <div className="flex flex-wrap gap-5 items-start">
        <div className="min-w-0" style={{ flex: "999 1 640px" }}>
          <UserDetailActivity />
        </div>
        <div className="min-w-0" style={{ flex: "1 1 360px" }}>
          <UserDetailEvents userId={userId} />
        </div>
      </div>
    </div>
  );
}

export { UserDetailContent, type UserDetailContentProps };
