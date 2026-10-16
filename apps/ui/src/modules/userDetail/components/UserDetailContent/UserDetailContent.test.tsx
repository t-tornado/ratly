import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDetailContent } from ".";

describe("UserDetailContent", () => {
  it("renders with data-testid", () => {
    render(<UserDetailContent />);
    expect(screen.getByTestId("user-detail-content")).toBeInTheDocument();
  });

  it("renders stats section", () => {
    render(<UserDetailContent />);
    expect(screen.getByTestId("user-detail-stats")).toBeInTheDocument();
  });

  it("renders activity section", () => {
    render(<UserDetailContent />);
    expect(screen.getByTestId("user-detail-activity")).toBeInTheDocument();
  });

  it("renders requests section", () => {
    render(<UserDetailContent />);
    expect(screen.getByTestId("user-detail-requests")).toBeInTheDocument();
  });

  it("renders events section", () => {
    render(<UserDetailContent />);
    expect(screen.getByTestId("user-detail-events")).toBeInTheDocument();
  });
});
