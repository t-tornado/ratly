import { cn } from "../../lib/utils";
import { StatCard } from "../StatCard";

interface StatItem {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}

interface StatsRowProps extends React.ComponentProps<"section"> {
  items: StatItem[];
}

function StatsRow({ items, className, ...props }: StatsRowProps) {
  return (
    <section
      aria-label="Current stats"
      className={cn(
        "grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3",
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
        />
      ))}
    </section>
  );
}

export { StatsRow };
