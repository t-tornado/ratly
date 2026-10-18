import { cn } from "../../lib/utils";
import { StatCard } from "../StatCard";
import type { StatCardAccent } from "../StatCard";

interface StatItem {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: StatCardAccent;
  indicator?: React.ReactNode;
}

interface StatsRowProps extends React.ComponentProps<"section"> {
  items: StatItem[];
}

function StatsRow({ items, className, ...props }: StatsRowProps) {
  return (
    <section
      aria-label="Current stats"
      className={cn(
        "grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          sub={item.sub}
          accent={item.accent}
          indicator={item.indicator}
        />
      ))}
    </section>
  );
}

export { StatsRow, type StatsRowProps, type StatItem };
