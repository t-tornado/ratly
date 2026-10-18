import { cn } from "../../lib/utils";

type StatCardAccent = "default" | "success" | "warning" | "error";

const ACCENT_VALUE_CLASSES: Record<StatCardAccent, string> = {
  default: "text-text-primary",
  success: "text-success-text",
  warning: "text-warning-text",
  error: "text-error-text",
};

interface StatCardProps extends React.ComponentProps<"div"> {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: StatCardAccent;
  indicator?: React.ReactNode;
}

function StatCard({ label, value, sub, accent = "default", indicator, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border-default bg-bg-surface-raised px-4.5 py-4",
        className
      )}
      {...props}
    >
      {indicator && (
        <div className="absolute top-3 right-3">{indicator}</div>
      )}
      <div className="text-base font-semibold text-text-secondary mb-1">
        {label}
      </div>
      <div
        className={cn(
          "text-5xl font-semibold font-sans leading-tight",
          ACCENT_VALUE_CLASSES[accent]
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="text-sm text-text-muted mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}

export { StatCard, type StatCardProps, type StatCardAccent };
