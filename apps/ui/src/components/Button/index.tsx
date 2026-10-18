import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-sans transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-0 bg-warning text-bg-base font-semibold",
        accent:
          "border-0 bg-accent-blue text-bg-base font-semibold",
        destructive:
          "border-0 bg-error text-bg-base font-semibold",
        ghost:
          "border border-border-strong bg-transparent text-text-primary",
        "destructive-ghost":
          "border border-border-strong bg-transparent text-error-text",
        "warning-ghost":
          "border border-warning-border bg-transparent text-warning-text",
        filter:
          "border-0 bg-transparent text-text-tertiary text-base-sm",
        "filter-active":
          "border-0 bg-bg-surface-raised text-text-primary font-medium text-base-sm ring-1 ring-border-strong",
        "icon-only":
          "border border-border-strong bg-transparent text-text-tertiary",
      },
      size: {
        default: "h-10 px-3.5 rounded-lg text-sm",
        sm: "h-9 px-3 rounded-lg text-base-sm",
        compact: "h-8 px-3 rounded-md text-base-sm",
        filter: "h-[34px] px-3 rounded-md",
        icon: "size-9 rounded-lg",
        pill: "h-9 px-3 rounded-pill text-base-sm",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

function Button({
  className,
  variant,
  size,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }), "relative")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <Loader2 className="size-4 animate-spin" />
        </span>
      )}
      {isLoading ? (
        <span className="opacity-0">{children}</span>
      ) : (
        children
      )}
    </button>
  );
}

export { Button };
