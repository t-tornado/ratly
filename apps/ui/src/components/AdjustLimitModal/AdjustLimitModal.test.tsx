import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { AdjustLimitModal } from ".";

const DEFAULT_PROPS = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  userId: "usr_3e88d1",
  currentLimit: 100,
  currentRemaining: 42,
};

function renderModal(
  overrides: Partial<React.ComponentProps<typeof AdjustLimitModal>> = {}
) {
  return render(<AdjustLimitModal {...DEFAULT_PROPS} {...overrides} />);
}

describe("AdjustLimitModal", () => {
  it("renders when open", () => {
    renderModal();
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("shows title with userId", () => {
    renderModal();
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Adjust limit for usr_3e88d1"
    );
  });

  it("shows current limit in label", () => {
    renderModal();
    expect(
      screen.getByText("Requests per hour (now 100)")
    ).toBeInTheDocument();
  });

  it("shows input with current limit value", () => {
    renderModal();
    const limitInput = screen.getByTestId("limit-input");
    expect(limitInput).toHaveValue(100);
  });

  it("updates value when typing", () => {
    renderModal();
    const limitInput = screen.getByTestId("limit-input");
    fireEvent.change(limitInput, { target: { value: "250" } });
    expect(limitInput).toHaveValue(250);
  });

  it("renders all preset buttons", () => {
    renderModal();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("100 \u00b7 default")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("preset buttons update value", () => {
    renderModal();
    fireEvent.click(screen.getByText("150"));
    const limitInput = screen.getByTestId("limit-input");
    expect(limitInput).toHaveValue(150);
  });

  it("shows correct remaining preview", () => {
    renderModal({ currentLimit: 100, currentRemaining: 42 });
    fireEvent.click(screen.getByText("500"));
    const modalBody = screen.getByTestId("modal-body");
    expect(modalBody.textContent).toContain("Remaining becomes");
    expect(modalBody.textContent).toContain("442 / 500");
    expect(modalBody.textContent).toContain("\u00b7 OK");
  });

  it("calls onConfirm with new limit when confirmed", () => {
    const handleConfirm = vi.fn();
    renderModal({ onConfirm: handleConfirm });
    fireEvent.click(screen.getByText("500"));
    fireEvent.click(screen.getByText("Set limit to 500"));
    expect(handleConfirm).toHaveBeenCalledWith(500);
  });
});
