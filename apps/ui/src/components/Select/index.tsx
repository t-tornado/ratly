import { cn } from "../../lib/utils";

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-10 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-2.5 text-[var(--color-text-primary)] font-[family-name:var(--font-sans)] text-sm outline-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
