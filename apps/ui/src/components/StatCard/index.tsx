import { cn } from "../../lib/utils";

interface StatCardProps extends React.ComponentProps<"div"> {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}

function StatCard({ label, value, sub, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface-raised)] px-4.5 py-4",
        className
      )}
      {...props}
    >
      <div className="text-[12px] text-[var(--color-text-secondary)] mb-1">
        {label}
      </div>
      <div className="text-[32px] font-semibold font-[family-name:var(--font-sans)] leading-tight">
        {value}
      </div>
      {sub && (
        <div className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}

export { StatCard };
