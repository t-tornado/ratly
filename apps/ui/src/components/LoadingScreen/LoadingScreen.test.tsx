import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingScreen } from ".";

describe("LoadingScreen", () => {
  it("renders Logo", () => {
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders default message", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<LoadingScreen message="Fetching data" />);
    expect(screen.getByText("Fetching data")).toBeInTheDocument();
  });
});
