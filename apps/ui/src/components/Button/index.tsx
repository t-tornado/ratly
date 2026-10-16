import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-[family-name:var(--font-sans)] transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-0 bg-[var(--color-warning)] text-[var(--color-bg-base)] font-semibold",
        accent:
          "border-0 bg-[var(--color-accent-blue)] text-[var(--color-bg-base)] font-semibold",
        destructive:
          "border-0 bg-[var(--color-error)] text-[var(--color-bg-base)] font-semibold",
        ghost:
          "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-primary)]",
        "destructive-ghost":
          "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-error-text)]",
        "warning-ghost":
          "border border-[var(--color-warning-border)] bg-transparent text-[var(--color-warning-text)]",
        filter:
          "border-0 bg-transparent text-[var(--color-text-tertiary)] text-[13px]",
        "filter-active":
          "border-0 bg-[var(--color-border-active)] text-[var(--color-text-primary)] text-[13px]",
        "icon-only":
          "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-tertiary)]",
      },
      size: {
        default: "h-10 px-3.5 rounded-[var(--radius-lg)] text-sm",
        sm: "h-9 px-3 rounded-[var(--radius-lg)] text-[13px]",
        compact: "h-8 px-3 rounded-[var(--radius-md)] text-[13px]",
        filter: "h-[34px] px-3 rounded-[var(--radius-md)]",
        icon: "size-9 rounded-[var(--radius-lg)]",
        pill: "h-9 px-3 rounded-[var(--radius-pill)] text-[13px]",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
