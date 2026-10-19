import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast } from ".";

describe("Toast", () => {
  it("renders title and description", () => {
    render(<Toast title="Success" description="Operation completed" />);
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Operation completed")).toBeInTheDocument();
  });

  it("renders error variant icon", () => {
    const { container } = render(<Toast variant="error" title="Error" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Toast><span data-testid="child">Custom</span></Toast>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
