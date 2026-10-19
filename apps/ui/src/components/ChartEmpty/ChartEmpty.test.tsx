import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartEmpty } from ".";

describe("ChartEmpty", () => {
  it("renders default message", () => {
    render(<ChartEmpty />);
    expect(screen.getByText("No activity recorded")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ChartEmpty message="No data" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders icon", () => {
    const { container } = render(<ChartEmpty />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
