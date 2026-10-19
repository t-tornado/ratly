import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ThrottlingModal } from ".";

const DEFAULT_PROPS = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  userId: "usr_abc123",
};

describe("ThrottlingModal — Start variant (isThrottling=true)", () => {
  it("renders start title when isThrottling=true", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={true} />
    );
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Start throttling for usr_abc123"
    );
  });

  it("shows pause description", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={true} />
    );
    expect(
      screen.getByText(/Requests still get counted, but none are rejected/)
    ).toBeInTheDocument();
  });

  it("shows duration buttons", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={true} />
    );
    expect(screen.getByTestId("duration-buttons")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("1 hour")).toBeInTheDocument();
    expect(screen.getByText("24 hours")).toBeInTheDocument();
  });

  it("selects 1h by default", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={true} />
    );
    const oneHourButton = screen.getByText("1 hour");
    expect(oneHourButton.className).toContain("border-accent-blue");
    expect(oneHourButton.className).toContain("bg-bg-active");
  });

  it("changes selection when clicking different duration", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={true} />
    );
    const fifteenMinButton = screen.getByText("15 min");
    fireEvent.click(fifteenMinButton);
    expect(fifteenMinButton.className).toContain("border-accent-blue");
    expect(fifteenMinButton.className).toContain("bg-bg-active");

    const oneHourButton = screen.getByText("1 hour");
    expect(oneHourButton.className).not.toContain(
      "bg-bg-active"
    );
  });

  it("shows warning info box with resume time", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={true} />
    );
    const warningBox = screen.getByTestId("warning-info-box");
    expect(warningBox).toBeInTheDocument();
    expect(warningBox).toHaveTextContent(/Resumes at/);
  });

  it("calls onConfirm with selected duration", () => {
    const handleConfirm = vi.fn();
    render(
      <ThrottlingModal
        {...DEFAULT_PROPS}
        isThrottling={true}
        onConfirm={handleConfirm}
      />
    );
    fireEvent.click(screen.getByText("24 hours"));
    fireEvent.click(screen.getByText("Start throttling"));
    expect(handleConfirm).toHaveBeenCalledWith("24h");
  });

  it('confirm button says "Start throttling"', () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={true} />
    );
    expect(screen.getByText("Start throttling")).toBeInTheDocument();
  });
});

describe("ThrottlingModal — Stop variant (isThrottling=false)", () => {
  it("renders stop title when isThrottling=false", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={false} />
    );
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Stop throttling for usr_abc123"
    );
  });

  it("shows resume description with remaining count", () => {
    render(
      <ThrottlingModal
        {...DEFAULT_PROPS}
        isThrottling={false}
        currentRemaining={42}
      />
    );
    expect(
      screen.getByText(/The user has 42 left in this window/)
    ).toBeInTheDocument();
  });

  it("does not show duration buttons", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={false} />
    );
    expect(screen.queryByTestId("duration-buttons")).not.toBeInTheDocument();
  });

  it("does not show warning info box", () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={false} />
    );
    expect(screen.queryByTestId("warning-info-box")).not.toBeInTheDocument();
  });

  it("calls onConfirm without duration", () => {
    const handleConfirm = vi.fn();
    render(
      <ThrottlingModal
        {...DEFAULT_PROPS}
        isThrottling={false}
        onConfirm={handleConfirm}
      />
    );
    fireEvent.click(screen.getByText("Stop throttling"));
    expect(handleConfirm).toHaveBeenCalledWith();
  });

  it('confirm button says "Stop throttling"', () => {
    render(
      <ThrottlingModal {...DEFAULT_PROPS} isThrottling={false} />
    );
    expect(screen.getByText("Stop throttling")).toBeInTheDocument();
  });
});
