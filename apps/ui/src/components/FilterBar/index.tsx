import { SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import { SearchInput } from "../SearchInput";
import { Button } from "../Button";
import { Select } from "../Select";

interface FilterOption {
  label: string;
  count?: number;
  active?: boolean;
  color?: string;
}

interface FilterBarProps extends React.ComponentProps<"div"> {
  searchPlaceholder?: string;
  filters: FilterOption[];
  onFilterChange?: (label: string) => void;
  onSearchChange?: (value: string) => void;
  onSelectChange?: (value: string) => void;
  selectOptions?: { label: string; value: string }[];
  selectLabel?: string;
}

function FilterBar({
  searchPlaceholder = "Search user ID…",
  filters,
  onFilterChange,
  onSearchChange,
  onSelectChange,
  selectOptions,
  selectLabel,
  className,
  ...props
}: FilterBarProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      {...props}
    >
      <SearchInput
        placeholder={searchPlaceholder}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className="flex-1 min-w-[200px]"
      />

      <div className="hidden sm:block w-px h-5 bg-border-default shrink-0" />

      <div role="group" aria-label="Status filter" className="flex items-center gap-1.5 shrink-0">
        <SlidersHorizontal size={13} className="text-text-tertiary opacity-40 shrink-0" />
        {filters.map((f) => (
          <Button
            key={f.label}
            variant={f.active ? "filter-active" : "filter"}
            size="filter"
            onClick={() => onFilterChange?.(f.label)}
            aria-pressed={f.active}
          >
            {f.color && (
              <span
                className="size-1.5 rounded-full shrink-0 mr-1.5"
                style={{ backgroundColor: f.color }}
              />
            )}
            {f.label}
            {f.count != null && <span className="ml-1 opacity-60">[{f.count}]</span>}
          </Button>
        ))}
      </div>

      {selectOptions && (
        <>
          <div className="hidden sm:block w-px h-5 bg-border-default shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            {selectLabel && (
              <span className="text-text-secondary text-sm whitespace-nowrap">
                {selectLabel}
              </span>
            )}
            <Select
              aria-label={selectLabel ?? "Filter"}
              onChange={(e) => onSelectChange?.(e.target.value)}
            >
              {selectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </>
      )}
    </div>
  );
}

export { FilterBar, type FilterBarProps, type FilterOption };
