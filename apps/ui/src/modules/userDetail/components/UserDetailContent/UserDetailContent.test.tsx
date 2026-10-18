import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { UserDetailContent } from ".";

function renderContent() {
  return renderWithProviders(
    <MemoryRouter>
      <UserDetailContent userId="usr_test123" />
    </MemoryRouter>
  );
}

describe("UserDetailContent", () => {
  it("renders with data-testid", () => {
    renderContent();
    expect(screen.getByTestId("user-detail-content")).toBeInTheDocument();
  });

  it("renders stats section", () => {
    renderContent();
    expect(screen.getByTestId("user-detail-stats")).toBeInTheDocument();
  });

  it("renders activity section", () => {
    renderContent();
    expect(screen.getByTestId("user-detail-activity")).toBeInTheDocument();
  });

  it("renders events section", () => {
    renderContent();
    expect(screen.getByTestId("user-detail-events")).toBeInTheDocument();
  });
});
