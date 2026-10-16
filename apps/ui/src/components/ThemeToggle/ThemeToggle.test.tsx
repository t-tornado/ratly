import { describe, it, expect } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ThemeToggle } from ".";

describe("ThemeToggle", () => {
  it("renders without crashing", () => {
    renderWithProviders(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label for dark theme", () => {
    renderWithProviders(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", expect.stringMatching(/switch to/i));
  });

  it("clicking toggle changes aria-label", () => {
    renderWithProviders(<ThemeToggle />);
    const button = screen.getByRole("button");
    const initialLabel = button.getAttribute("aria-label");

    fireEvent.click(button);

    expect(button.getAttribute("aria-label")).not.toBe(initialLabel);
  });

  it("renders an svg icon", () => {
    renderWithProviders(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });
});
