import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ActionMenu } from ".";

function openDropdown(triggerLabel = "Open actions") {
  const trigger = screen.getByRole("button", { name: triggerLabel });
  act(() => {
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    fireEvent.pointerUp(trigger, { button: 0 });
    fireEvent.click(trigger);
  });
}

const SAMPLE_ITEMS = [
  { label: "Reset window", onClick: vi.fn() },
  { label: "Adjust limit", onClick: vi.fn() },
  { label: "Hidden item", onClick: vi.fn(), hidden: true },
];

describe("ActionMenu", () => {
  it("renders trigger button", () => {
    render(<ActionMenu items={SAMPLE_ITEMS} />);
    expect(screen.getByRole("button", { name: "Open actions" })).toBeInTheDocument();
  });

  it("shows visible items when dropdown is opened", () => {
    render(<ActionMenu items={SAMPLE_ITEMS} />);
    openDropdown();
    expect(screen.getByText("Reset window")).toBeInTheDocument();
    expect(screen.getByText("Adjust limit")).toBeInTheDocument();
  });

  it("does not render hidden items when dropdown is opened", () => {
    render(<ActionMenu items={SAMPLE_ITEMS} />);
    openDropdown();
    expect(screen.queryByText("Hidden item")).not.toBeInTheDocument();
  });

  it("calls onClick when a visible item is clicked", () => {
    const handleClick = vi.fn();
    render(<ActionMenu items={[{ label: "Click me", onClick: handleClick }]} />);
    openDropdown();
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("uses custom triggerLabel for aria-label", () => {
    render(<ActionMenu items={[]} triggerLabel="Admin actions for user" />);
    expect(
      screen.getByRole("button", { name: "Admin actions for user" })
    ).toBeInTheDocument();
  });
});
