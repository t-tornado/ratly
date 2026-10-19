import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ProgressBar } from ".";

describe("ProgressBar", () => {
  it("width matches percent value", () => {
    const { container } = render(<ProgressBar value={42} />);
    const bar = container.querySelector("[role='progressbar']");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "42");
  });

  it("clamps value at 100%", () => {
    const { container } = render(<ProgressBar value={150} />);
    const bar = container.querySelector("[role='progressbar']");
    expect(bar).toHaveAttribute("aria-valuenow", "150");
  });

  it("applies variant color classes", () => {
    const { container } = render(<ProgressBar value={50} variant="exceeded" />);
    expect(container.innerHTML).toContain("bg-error");
  });
});
