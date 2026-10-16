import { UserDetailStats } from "../UserDetailStats";
import { UserDetailActivity } from "../UserDetailActivity";
import { UserDetailRequests } from "../UserDetailRequests";
import { UserDetailEvents } from "../UserDetailEvents";

function UserDetailContent() {
  return (
    <div data-testid="user-detail-content" className="flex flex-col gap-5">
      <UserDetailStats />
      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0" style={{ flex: "999 1 640px" }}>
          <UserDetailActivity />
          <UserDetailRequests />
        </div>
        <div className="min-w-0" style={{ flex: "1 1 360px" }}>
          <UserDetailEvents />
        </div>
      </div>
    </div>
  );
}

export { UserDetailContent };
