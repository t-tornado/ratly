import { cn } from "../../lib/utils";

function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised px-4 py-3.5 font-mono text-sm leading-relaxed whitespace-pre-line",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlock };
