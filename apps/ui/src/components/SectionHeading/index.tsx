import { cn } from "../../lib/utils";

function SectionHeading({
  className,
  children,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "m-0 mb-3 text-[13px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-secondary)]",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export { SectionHeading };
