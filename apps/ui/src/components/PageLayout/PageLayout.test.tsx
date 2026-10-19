import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageLayout } from ".";

describe("PageLayout", () => {
  it("renders children", () => {
    render(<PageLayout><div data-testid="child">Content</div></PageLayout>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies data-testid when provided", () => {
    render(<PageLayout testId="dashboard-layout"><div>Content</div></PageLayout>);
    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
  });
});
