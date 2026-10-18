import { StatsRow } from "../../../../components/StatsRow";
import { useUserDetailStats } from "../../hooks/useUserDetailStats";
import { FetchStatusIndicator } from "../../../../components/FetchStatusIndicator";

interface UserDetailStatsProps {
  userId: string;
}

function UserDetailStats({ userId }: UserDetailStatsProps) {
  const { statItems, isError } = useUserDetailStats(userId);
  const indicator = <FetchStatusIndicator isError={isError} />;
  const items = statItems.map((item) => ({ ...item, indicator }));

  return <StatsRow data-testid="user-detail-stats" items={items} />;
}

export { UserDetailStats, type UserDetailStatsProps };
