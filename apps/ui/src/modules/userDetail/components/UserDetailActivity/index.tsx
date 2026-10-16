import { useState } from "react";
import { ActivityChart } from "../../../../components/ActivityChart";

const CHART_HEIGHT = 160;
const BAR_GAP = 3;
const TIME_LABELS = ["13:17", "13:32", "13:47", "14:02"];

const ALLOWED_HEIGHTS = [
  7, 35, 22, 27, 33, 13, 36, 16, 31, 29, 19, 36, 10, 34, 25, 25, 34, 10, 36,
  19, 29, 31, 16, 36, 13, 33, 27, 22, 35, 7, 35, 22, 27, 33, 13, 36, 16, 31,
  29, 19, 107, 88, 43, 97, 104, 60, 74, 108, 87, 44, 97, 104, 59, 75, 108, 86,
  46, 98, 103, 58,
];

const REJECTED_HEIGHTS = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 14, 0, 0, 14, 0, 0,
];

const BAR_COUNT = ALLOWED_HEIGHTS.length;

function UserDetailActivity() {
  const [activeRange, setActiveRange] = useState<"hour" | "day">("hour");

  const chartWidth = BAR_COUNT * (8 + BAR_GAP);
  const labelSpacing = chartWidth / (TIME_LABELS.length + 1);

  return (
    <div data-testid="user-detail-activity">
      <ActivityChart
        title="Activity · requests per minute"
        activeRange={activeRange}
        onRangeChange={setActiveRange}
      >
        <svg
          role="img"
          aria-label="Requests per minute over the past hour, with a burst near the end"
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT + 24}`}
          className="w-full"
          preserveAspectRatio="none"
        >
          {ALLOWED_HEIGHTS.map((allowedHeight, index) => {
            const rejectedHeight = REJECTED_HEIGHTS[index];
            const barX = index * (8 + BAR_GAP);
            const allowedY = CHART_HEIGHT - allowedHeight - rejectedHeight;
            const rejectedY = CHART_HEIGHT - rejectedHeight;

            return (
              <g key={index}>
                {rejectedHeight > 0 && (
                  <rect
                    x={barX}
                    y={rejectedY}
                    width={8}
                    height={rejectedHeight}
                    rx={1}
                    fill="var(--color-error)"
                  />
                )}
                <rect
                  x={barX}
                  y={allowedY}
                  width={8}
                  height={allowedHeight}
                  rx={1}
                  fill="var(--color-accent-blue)"
                  opacity={0.85}
                />
              </g>
            );
          })}
          <line
            x1={0}
            y1={CHART_HEIGHT}
            x2={chartWidth}
            y2={CHART_HEIGHT}
            stroke="var(--color-border-strong)"
            strokeWidth={1}
          />
          {TIME_LABELS.map((label, index) => (
            <text
              key={label}
              x={(index + 1) * labelSpacing}
              y={CHART_HEIGHT + 16}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize={11}
              fontFamily="var(--font-mono)"
            >
              {label}
            </text>
          ))}
        </svg>
        <div className="flex items-center gap-4 mt-3 text-[11px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-[var(--color-accent-blue)] opacity-85" />
            Allowed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-[var(--color-error)]" />
            Rejected
          </span>
        </div>
      </ActivityChart>
    </div>
  );
}

export { UserDetailActivity };
