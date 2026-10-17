import { StatsRow } from "../../../../components/StatsRow";
import type { StatItem } from "../../../../components/StatsRow";

const USER_DETAIL_STATS: StatItem[] = [
  {
    label: "Remaining",
    value: "14",
    sub: (
      <span>
        of 150{" "}
        <span className="text-accent-purple">
          (admin override)
        </span>
      </span>
    ),
    accent: "warning",
  },
  {
    label: "Resets in",
    value: "4m 02s",
    sub: "window: 15 min",
  },
  {
    label: "Current window",
    value: "136",
    sub: "89 allowed · 47 rejected",
    accent: "error",
  },
  {
    label: "Last reset",
    value: "13:11:58",
    sub: "today",
  },
  {
    label: "429s today",
    value: "47",
    sub: "first at 12:04:22",
    accent: "error",
  },
];

function UserDetailStats() {
  return <StatsRow data-testid="user-detail-stats" items={USER_DETAIL_STATS} />;
}

export { UserDetailStats };
