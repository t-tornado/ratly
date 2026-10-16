import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../../../../providers/ThemeProvider";
import { UserDetailHeader } from ".";

function renderHeader(
  props: Partial<React.ComponentProps<typeof UserDetailHeader>> = {}
) {
  const defaultProps = {
    userId: "usr_test123",
    status: "status-ok" as const,
    statusLabel: "OK",
    isThrottling: false,
    currentLimit: 100,
    currentRemaining: 42,
  };
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <UserDetailHeader {...defaultProps} {...props} />
      </MemoryRouter>
    </ThemeProvider>
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

  it("back link uses routes.dashboard", () => {
    renderHeader();
    const backLink = screen.getByText("← Users");
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("renders all 4 action buttons", () => {
    renderHeader();
    const actionsGroup = screen.getByTestId("admin-actions");
    expect(actionsGroup).toBeInTheDocument();
    expect(screen.getByText("Reset window")).toBeInTheDocument();
    expect(screen.getByText("Adjust limit")).toBeInTheDocument();
    expect(screen.getByText("Add extra requests")).toBeInTheDocument();
  });

  it("shows 'Start Throttling' when isThrottling is false", () => {
    renderHeader({ isThrottling: false });
    expect(screen.getByText("Start Throttling")).toBeInTheDocument();
  });

  it("shows 'Pause Throttling' when isThrottling is true", () => {
    renderHeader({ isThrottling: true });
    expect(screen.getByText("Pause Throttling")).toBeInTheDocument();
  });

  it("opens ResetWindowModal when Reset window button clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByText("Reset window"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Reset window for"
    );
  });

  it("opens AdjustLimitModal when Adjust limit button clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByText("Adjust limit"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Adjust limit for"
    );
  });

  it("opens AddExtraRequestsModal when Add extra requests button clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByText("Add extra requests"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Add extra requests for"
    );
  });

  it("opens ThrottlingModal with pause variant when isThrottling is true", () => {
    renderHeader({ isThrottling: true });
    fireEvent.click(screen.getByText("Pause Throttling"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Pause throttling for"
    );
  });

  it("opens ThrottlingModal with resume variant when isThrottling is false", () => {
    renderHeader({ isThrottling: false });
    fireEvent.click(screen.getByText("Start Throttling"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Resume throttling for"
    );
  });
});
