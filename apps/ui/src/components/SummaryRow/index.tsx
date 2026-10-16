import { cn } from "../../lib/utils";
import { StatCard } from "../StatCard";

interface SummaryItem {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}

interface SummaryRowProps extends React.ComponentProps<"section"> {
  items: SummaryItem[];
}

function SummaryRow({ items, className, ...props }: SummaryRowProps) {
  return (
    <section
      aria-label="Summary"
      className={cn(
        "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3",
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

export { SummaryRow };
