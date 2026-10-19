import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from ".";

describe("SearchInput", () => {
  it("renders search input", () => {
    render(<SearchInput placeholder="Search..." />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("fires onChange", () => {
    const handleChange = vi.fn();
    render(<SearchInput placeholder="Search..." onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "test" } });
    expect(handleChange).toHaveBeenCalled();
  });
});
