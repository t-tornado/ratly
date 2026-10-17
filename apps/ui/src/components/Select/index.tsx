import { cn } from "../../lib/utils";

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-10 rounded-lg border border-border-strong bg-bg-base px-2.5 text-text-primary font-sans text-sm outline-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
