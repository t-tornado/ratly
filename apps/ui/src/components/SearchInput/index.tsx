import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

function SearchInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-transparent px-3 h-10",
        className
      )}
    >
      <Search className="size-4 text-[var(--color-text-muted)] shrink-0" />
      <input
        type="search"
        className="w-full bg-transparent border-0 outline-none text-[var(--color-text-primary)] font-[family-name:var(--font-mono)] text-[13px] placeholder:text-[var(--color-text-muted)]"
        {...props}
      />
    </div>
  );
}

export { SearchInput };
