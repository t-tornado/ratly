import { cn } from "../../lib/utils";

type StatCardAccent = "default" | "success" | "warning" | "error";

const ACCENT_VALUE_CLASSES: Record<StatCardAccent, string> = {
  default: "",
  success: "text-[var(--color-success-text)]",
  warning: "text-[var(--color-warning-text)]",
  error: "text-[var(--color-error-text)]",
};

interface StatCardProps extends React.ComponentProps<"div"> {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: StatCardAccent;
}

function StatCard({ label, value, sub, accent = "default", className, ...props }: StatCardProps) {
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
      <div
        className={cn(
          "text-[32px] font-semibold font-[family-name:var(--font-sans)] leading-tight",
          ACCENT_VALUE_CLASSES[accent]
        )}
      >
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

export { StatCard, type StatCardProps, type StatCardAccent };
