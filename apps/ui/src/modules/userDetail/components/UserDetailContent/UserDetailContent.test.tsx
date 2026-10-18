import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { UserDetailContent } from ".";

describe("UserDetailContent", () => {
  it("renders with data-testid", () => {
    renderWithProviders(<UserDetailContent userId="usr_test123" />);
    expect(screen.getByTestId("user-detail-content")).toBeInTheDocument();
  });

  it("renders stats section", () => {
    renderWithProviders(<UserDetailContent userId="usr_test123" />);
    expect(screen.getByTestId("user-detail-stats")).toBeInTheDocument();
  });

  it("renders activity section", () => {
    renderWithProviders(<UserDetailContent userId="usr_test123" />);
    expect(screen.getByTestId("user-detail-activity")).toBeInTheDocument();
  });

  it("renders events section", () => {
    renderWithProviders(<UserDetailContent userId="usr_test123" />);
    expect(screen.getByTestId("user-detail-events")).toBeInTheDocument();
  });
});
