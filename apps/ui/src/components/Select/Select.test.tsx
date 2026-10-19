import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from ".";

describe("Select", () => {
  it("renders options", () => {
    render(
      <Select aria-label="Test">
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("fires onChange", () => {
    const handleChange = vi.fn();
    render(
      <Select aria-label="Test" onChange={handleChange}>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
    expect(handleChange).toHaveBeenCalled();
  });
});
