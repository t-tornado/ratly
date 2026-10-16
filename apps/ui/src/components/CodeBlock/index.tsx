import { cn } from "../../lib/utils";

function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface-raised)] px-4 py-3.5 font-[family-name:var(--font-mono)] text-[12px] leading-[1.7] whitespace-pre-line",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlock };
