import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from ".";

const filters = [
  { label: "All", count: 10, active: true },
  { label: "Warning", count: 3, color: "#f59e0b" },
  { label: "Exceeded", count: 2, color: "#ef4444" },
];

describe("FilterBar", () => {
  it("renders all filter buttons", () => {
    render(<FilterBar filters={filters} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Exceeded")).toBeInTheDocument();
  });

  it("active filter has aria-pressed=true", () => {
    render(<FilterBar filters={filters} />);
    expect(screen.getByText("All").closest("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("shows count badges", () => {
    render(<FilterBar filters={filters} />);
    expect(screen.getByText("[10]")).toBeInTheDocument();
    expect(screen.getByText("[3]")).toBeInTheDocument();
  });

  it("search fires onSearchChange", () => {
    const handleSearch = vi.fn();
    render(<FilterBar filters={filters} onSearchChange={handleSearch} />);
    fireEvent.change(screen.getByPlaceholderText("Search user ID…"), { target: { value: "test" } });
    expect(handleSearch).toHaveBeenCalledWith("test");
  });

  it("filter click fires onFilterChange", () => {
    const handleFilter = vi.fn();
    render(<FilterBar filters={filters} onFilterChange={handleFilter} />);
    fireEvent.click(screen.getByText("Warning"));
    expect(handleFilter).toHaveBeenCalledWith("Warning");
  });

  it("select fires onSelectChange", () => {
    const handleSelect = vi.fn();
    render(
      <FilterBar
        filters={filters}
        selectOptions={[
          { label: "1h", value: "1h" },
          { label: "24h", value: "24h" },
        ]}
        selectLabel="Time"
        onSelectChange={handleSelect}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "24h" } });
    expect(handleSelect).toHaveBeenCalledWith("24h");
  });

  it("hides select when no selectOptions", () => {
    render(<FilterBar filters={filters} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
