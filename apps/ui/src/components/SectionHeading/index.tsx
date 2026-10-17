import { cn } from "../../lib/utils";

function SectionHeading({
  className,
  children,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "m-0 mb-3 text-base-sm font-medium uppercase tracking-wider text-text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export { SectionHeading };
