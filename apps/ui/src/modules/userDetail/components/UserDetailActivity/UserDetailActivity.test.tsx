import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDetailActivity } from ".";

describe("UserDetailActivity", () => {
  it("renders with data-testid", () => {
    render(<UserDetailActivity />);
    expect(screen.getByTestId("user-detail-activity")).toBeInTheDocument();
  });

  it("shows activity heading", () => {
    render(<UserDetailActivity />);
    expect(
      screen.getByText("Activity · requests per minute")
    ).toBeInTheDocument();
  });

  it("has range toggle buttons", () => {
    render(<UserDetailActivity />);
    expect(screen.getByText("Past hour")).toBeInTheDocument();
    expect(screen.getByText("Past day")).toBeInTheDocument();
  });

  it("shows chart with aria label", () => {
    render(<UserDetailActivity />);
    expect(
      screen.getByLabelText(
        "Requests per minute over the past hour, with a burst near the end"
      )
    ).toBeInTheDocument();
  });

  it("shows legend items", () => {
    render(<UserDetailActivity />);
    expect(screen.getByText("Allowed")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });
});
