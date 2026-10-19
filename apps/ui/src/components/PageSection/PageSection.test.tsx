import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageSection } from ".";

describe("PageSection", () => {
  it("renders children", () => {
    render(<PageSection><div data-testid="child">Content</div></PageSection>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies data-testid", () => {
    render(<PageSection><div>Content</div></PageSection>);
    expect(screen.getByTestId("page-section")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <PageSection className="custom-class"><div>Content</div></PageSection>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
