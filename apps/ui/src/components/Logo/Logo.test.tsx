import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from ".";

describe("Logo", () => {
  it("renders LogoMark SVG", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("does not show wordmark by default", () => {
    render(<Logo />);
    expect(screen.queryByText("Ratly Console")).not.toBeInTheDocument();
  });

  it("shows wordmark when showWordmark is true", () => {
    render(<Logo showWordmark />);
    expect(screen.getByText("Ratly Console")).toBeInTheDocument();
  });
});
