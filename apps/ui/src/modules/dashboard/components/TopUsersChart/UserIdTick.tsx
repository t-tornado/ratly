import { ExternalLink } from "lucide-react";

interface UserIdTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  onClickUser: (userId: string) => void;
}

const ICON_SIZE = 14;
const ICON_GAP = 5;
const START_X = 4;

function UserIdTick({
  x: _x,
  y,
  payload,
  onClickUser,
}: UserIdTickProps) {
  if (!payload) return null;

  return (
    <g
      className="cursor-pointer"
      onClick={() => onClickUser(payload.value)}
    >
      <foreignObject
        x={START_X}
        y={(y ?? 0) - ICON_SIZE / 2}
        width={ICON_SIZE}
        height={ICON_SIZE}
      >
        <ExternalLink size={ICON_SIZE} className="text-accent-blue" />
      </foreignObject>
      <text
        x={START_X + ICON_SIZE + ICON_GAP}
        y={y}
        textAnchor="start"
        fontSize={11}
        fill="var(--color-accent-blue)"
        fontFamily="var(--font-mono)"
        dominantBaseline="central"
      >
        {payload.value}
      </text>
    </g>
  );
}

export { UserIdTick };
export type { UserIdTickProps };
