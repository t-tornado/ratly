import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const statusDotVariants = cva("inline-block size-2 rounded-full", {
  variants: {
    variant: {
      live: "bg-success shadow-glow-success",
      warning: "bg-warning",
    },
    pulsating: {
      true: "animate-pulse",
    },
  },
  defaultVariants: {
    variant: "live",
    pulsating: false,
  },
});

function StatusDot({
  variant,
  pulsating,
  className,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusDotVariants>) {
  return (
    <span
      className={cn(statusDotVariants({ variant, pulsating, className }))}
      aria-hidden="true"
      {...props}
    />
  );
}

export { StatusDot };
