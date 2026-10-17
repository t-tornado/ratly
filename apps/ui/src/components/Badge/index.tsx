import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        "status-ok":
          "border border-accent-blue text-accent-blue px-2 py-0.5 rounded-pill",
        "status-warning":
          "border border-warning text-warning px-2 py-0.5 rounded-pill",
        "status-exceeded":
          "border border-error text-error px-2 py-0.5 rounded-pill",
        "tag-info":
          "border border-accent-blue text-accent-blue px-1.5 py-px rounded-md text-xs font-normal",
        "tag-warning":
          "border border-warning text-warning px-1.5 py-px rounded-md text-xs font-normal",
        "tag-purple":
          "border border-accent-purple text-accent-purple px-1.5 py-px rounded-md text-xs font-normal",
        env: "border border-border-strong text-text-secondary px-2 py-0.5 rounded-md font-normal font-mono",
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
