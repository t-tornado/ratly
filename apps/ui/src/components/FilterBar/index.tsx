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

      <div role="group" aria-label="Status filter" className="flex gap-0.5">
        {filters.map((f) => (
          <Button
            key={f.label}
            variant={f.active ? "filter-active" : "filter"}
            size="filter"
            onClick={() => onFilterChange?.(f.label)}
            aria-pressed={f.active}
            style={f.color ? { color: f.color } : undefined}
          >
            {f.label}
            {f.count != null && (
              <span className="ml-1 text-xs opacity-70">{f.count}</span>
            )}
          </Button>
        ))}
      </div>

      {selectOptions && (
        <div className="flex items-center gap-2">
          {selectLabel && (
            <span className="text-text-secondary text-sm">
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
      )}
    </div>
  );
}

export { FilterBar, type FilterBarProps, type FilterOption };
