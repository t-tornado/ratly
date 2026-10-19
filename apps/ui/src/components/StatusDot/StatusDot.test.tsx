import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StatusDot } from ".";

describe("StatusDot", () => {
  it("renders with live variant", () => {
    const { container } = render(<StatusDot variant="live" />);
    const dot = container.querySelector("span");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("renders with warning variant", () => {
    const { container } = render(<StatusDot variant="warning" />);
    expect(container.innerHTML).toContain("bg-warning");
  });

  it("applies pulsating animation", () => {
    const { container } = render(<StatusDot pulsating />);
    expect(container.innerHTML).toContain("animate-pulse");
  });
});
