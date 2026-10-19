import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import type { TopUser } from "@ratly/core";
import { ChartEmpty } from "../../../../components/ChartEmpty";
import { SectionHeading } from "../../../../components/SectionHeading";
import { routes } from "../../../../routes";
import { TopUsersChartTooltip } from "./TopUsersChartTooltip";
import { UserIdTick } from "./UserIdTick";
import { FetchStatusIndicator } from "../../../../components/FetchStatusIndicator";

const BAR_COLOR = "var(--color-accent-blue)";
const EXCEEDED_COLOR = "var(--color-error)";
const CHART_HEIGHT = 500;
const BAR_GAP = 8;

interface TopUsersChartProps {
  topUsers: TopUser[];
  isError: boolean;
}

function TopUsersChart({ topUsers, isError }: TopUsersChartProps) {
  const navigate = useNavigate();

  const handleClickUser = (userId: string) => {
    navigate(routes.userDetail(userId));
  };

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface-raised px-4.5 py-4 mt-5 w-full lg:w-2/3 min-h-[560px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <SectionHeading>Top Requests by Window</SectionHeading>
        <FetchStatusIndicator isError={isError} />
      </div>
      {isError ? (
        <ChartEmpty
          className="flex-1"
          message="Failed to load chart data"
          description="Use the retry button in the header to refresh"
        />
      ) : topUsers.length === 0 ? (
        <ChartEmpty
          className="flex-1"
          message="No active windows"
          description="Top users will appear here once requests start flowing"
        />
      ) : (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} className="[&_svg]:outline-none [&_*:focus]:outline-none">
          <BarChart
            data={topUsers}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            barCategoryGap={BAR_GAP}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              axisLine={{ stroke: "var(--color-border-strong)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="userId"
              width={110}
              tick={<UserIdTick onClickUser={handleClickUser} />}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<TopUsersChartTooltip />}
              cursor={false}
            />
            <Bar dataKey="used" radius={[0, 4, 4, 0]} style={{ outline: "none" }} isAnimationActive={false}>
              {topUsers.map((user) => (
                <Cell
                  key={user.userId}
                  fill={user.used >= user.allowedTotal ? EXCEEDED_COLOR : BAR_COLOR}
                  opacity={0.85}
                  style={{ outline: "none" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export { TopUsersChart };
export type { TopUsersChartProps };
