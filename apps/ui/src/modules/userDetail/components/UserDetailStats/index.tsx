import { StatsRow } from "../../../../components/StatsRow";
import { useUserDetailStats } from "../../hooks/useUserDetailStats";

interface UserDetailStatsProps {
  userId: string;
}

function UserDetailStats({ userId }: UserDetailStatsProps) {
  const { statItems } = useUserDetailStats(userId);

  return <StatsRow data-testid="user-detail-stats" items={statItems} />;
}

export { UserDetailStats, type UserDetailStatsProps };
