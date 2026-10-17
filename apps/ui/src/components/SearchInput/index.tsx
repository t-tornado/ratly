import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

function SearchInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border-strong bg-transparent px-3 h-10",
        className
      )}
    >
      <Search className="size-4 text-text-muted shrink-0" />
      <input
        type="search"
        className="w-full bg-transparent border-0 outline-none text-text-primary font-mono text-base-sm placeholder:text-text-muted"
        {...props}
      />
    </div>
  );
}

export { SearchInput };
