import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserDetailHeader } from ".";

function renderHeader(props: Partial<React.ComponentProps<typeof UserDetailHeader>> = {}) {
  const defaultProps = {
    userId: "usr_test123",
    status: "status-ok" as const,
    statusLabel: "OK",
  };
  return render(
    <MemoryRouter>
      <UserDetailHeader {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

describe("UserDetailHeader", () => {
  it("renders with data-testid", () => {
    renderHeader();
    expect(screen.getByTestId("user-detail-header")).toBeInTheDocument();
  });

  it("contains PageHeader", () => {
    renderHeader();
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });

  it("contains the Logo SVG", () => {
    renderHeader();
    expect(screen.getByLabelText("Ratly logo")).toBeInTheDocument();
  });

  it("shows userId in heading", () => {
    renderHeader({ userId: "usr_abc" });
    const heading = screen.getByTestId("user-id");
    expect(heading).toHaveTextContent("usr_abc");
  });

  it("shows status badge with correct label", () => {
    renderHeader({ statusLabel: "Warning" });
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("shows streaming indicator when streaming", () => {
    renderHeader({ isStreaming: true });
    expect(screen.getByText("streaming")).toBeInTheDocument();
  });

  it("hides streaming indicator when not streaming", () => {
    renderHeader({ isStreaming: false });
    expect(screen.queryByText("streaming")).not.toBeInTheDocument();
  });

  it("renders action buttons when provided", () => {
    renderHeader({
      actions: [
        { label: "Reset window", variant: "destructive-ghost" },
        { label: "Adjust limit" },
      ],
    });
    const actionsGroup = screen.getByTestId("admin-actions");
    expect(actionsGroup).toBeInTheDocument();
    expect(screen.getByText("Reset window")).toBeInTheDocument();
    expect(screen.getByText("Adjust limit")).toBeInTheDocument();
  });

  it("back link uses routes.dashboard", () => {
    renderHeader();
    const backLink = screen.getByText("← Users");
    expect(backLink).toHaveAttribute("href", "/");
  });
});
