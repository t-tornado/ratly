import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from ".";

describe("Icon", () => {
  it("renders svg element", () => {
    const { container } = render(<Icon variant="search" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("applies size prop", () => {
    const { container } = render(<Icon variant="search" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });
});
