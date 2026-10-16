import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { StatusDot } from "../StatusDot";
import { Button } from "../Button";

const alertBannerVariants = cva(
  "flex flex-wrap items-center gap-3 rounded-[var(--radius-xl)] border px-4 py-3",
  {
    variants: {
      variant: {
        warning:
          "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning-text)]",
        error:
          "bg-[var(--color-error-surface)] border-[var(--color-error-border)] text-[var(--color-error-text)]",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

interface AlertBannerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertBannerVariants> {
  message: string;
  action?: { label: string; onClick?: () => void };
}

function AlertBanner({
  variant,
  message,
  action,
  className,
  ...props
}: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn(alertBannerVariants({ variant, className }))}
      {...props}
    >
      <StatusDot variant={variant === "error" ? "warning" : "warning"} />
      <span className="flex-1">{message}</span>
      {action && (
        <Button
          variant="warning-ghost"
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { AlertBanner };
