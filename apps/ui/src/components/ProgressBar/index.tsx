import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const progressBarVariants = cva("block rounded-[var(--radius-xs)]", {
  variants: {
    variant: {
      ok: "bg-[var(--color-accent-blue)]",
      warning: "bg-[var(--color-warning)]",
      exceeded: "bg-[var(--color-error)]",
    },
    barSize: {
      sm: "h-1.5",
      md: "h-2.5",
    },
  },
  defaultVariants: {
    variant: "ok",
    barSize: "sm",
  },
});

function ProgressBar({
  value,
  max = 100,
  variant,
  barSize,
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof progressBarVariants> & {
    value: number;
    max?: number;
  }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        "w-full rounded-[var(--radius-xs)] bg-[var(--color-border-default)]",
        barSize === "md" ? "h-2.5" : "h-1.5",
        className
      )}
      role="progressbar"
      aria-label="Progress"
      aria-valuenow={value}
      aria-valuemax={max}
      {...props}
    >
      <span
        className={cn(progressBarVariants({ variant, barSize }))}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { ProgressBar };
