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
      <div className="flex flex-col lg:flex-row gap-5 lg:h-[420px]">
        <div className="min-w-0 lg:flex-[2_1_0%]">
          <UserDetailActivity userId={userId} />
        </div>
        <div className="min-w-0 lg:flex-[1_1_0%]">
          <UserDetailEvents userId={userId} />
        </div>
      </div>
    </div>
  );
}

export { UserDetailContent, type UserDetailContentProps };
