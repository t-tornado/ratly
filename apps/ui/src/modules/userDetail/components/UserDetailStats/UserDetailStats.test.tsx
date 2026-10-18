import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { UserDetailStats } from ".";

describe("UserDetailStats", () => {
  it("renders with data-testid", () => {
    renderWithProviders(<UserDetailStats userId="usr_test123" />);
    expect(screen.getByTestId("user-detail-stats")).toBeInTheDocument();
  });

  it("shows all 4 stat labels", () => {
    renderWithProviders(<UserDetailStats userId="usr_test123" />);
    expect(screen.getByText("Remaining")).toBeInTheDocument();
    expect(screen.getByText("Resets in")).toBeInTheDocument();
    expect(screen.getByText("Last reset")).toBeInTheDocument();
    expect(screen.getByText("Rejected today")).toBeInTheDocument();
  });
});
