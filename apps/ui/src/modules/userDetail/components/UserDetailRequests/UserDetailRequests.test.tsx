import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDetailRequests } from ".";

describe("UserDetailRequests", () => {
  it("renders with data-testid", () => {
    render(<UserDetailRequests />);
    expect(screen.getByTestId("user-detail-requests")).toBeInTheDocument();
  });

  it("shows section heading", () => {
    render(<UserDetailRequests />);
    expect(screen.getByText("Recent requests")).toBeInTheDocument();
  });
});
