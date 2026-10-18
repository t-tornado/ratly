import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { UserDetailEvents } from ".";

describe("UserDetailEvents", () => {
  it("renders with data-testid", () => {
    renderWithProviders(<UserDetailEvents userId="usr_test123" />);
    expect(screen.getByTestId("user-detail-events")).toBeInTheDocument();
  });

  it("shows section heading", () => {
    renderWithProviders(<UserDetailEvents userId="usr_test123" />);
    expect(screen.getByText("Event stream")).toBeInTheDocument();
  });
});
