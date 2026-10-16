import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        "status-ok":
          "border border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] px-2 py-0.5 rounded-[var(--radius-pill)]",
        "status-warning":
          "border border-[var(--color-warning)] text-[var(--color-warning)] px-2 py-0.5 rounded-[var(--radius-pill)]",
        "status-exceeded":
          "border border-[var(--color-error)] text-[var(--color-error)] px-2 py-0.5 rounded-[var(--radius-pill)]",
        "tag-info":
          "border border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] px-1.5 py-px rounded-[var(--radius-md)] text-[11px] font-normal",
        "tag-warning":
          "border border-[var(--color-warning)] text-[var(--color-warning)] px-1.5 py-px rounded-[var(--radius-md)] text-[11px] font-normal",
        "tag-purple":
          "border border-[var(--color-accent-purple)] text-[var(--color-accent-purple)] px-1.5 py-px rounded-[var(--radius-md)] text-[11px] font-normal",
        env: "border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-[var(--radius-md)] font-normal font-[family-name:var(--font-mono)]",
      },
    },
    defaultVariants: {
      variant: "status-ok",
    },
  }
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, type BadgeProps };
