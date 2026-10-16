import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { PageHeader } from ".";

describe("PageHeader", () => {
  it("renders ThemeToggle inside header", () => {
    renderWithProviders(<PageHeader />);
    const header = screen.getByTestId("page-header");
    expect(header.querySelector("button")).toBeInTheDocument();
  });

  it("renders rightSlot content after ThemeToggle", () => {
    renderWithProviders(
      <PageHeader rightSlot={<span data-testid="right-slot">right</span>} />,
    );
    expect(screen.getByTestId("right-slot")).toBeInTheDocument();
  });

  it("renders children and logo", () => {
    renderWithProviders(
      <PageHeader>
        <span data-testid="child">child content</span>
      </PageHeader>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByLabelText("Ratly logo")).toBeInTheDocument();
  });

  it("renders with data-testid", () => {
    renderWithProviders(<PageHeader />);
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });
});
