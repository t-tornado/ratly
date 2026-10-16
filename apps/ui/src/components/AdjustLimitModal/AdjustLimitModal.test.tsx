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

  it("preset buttons update value", () => {
    renderModal();
    fireEvent.click(screen.getByText("500"));
    const limitInput = screen.getByTestId("limit-input");
    expect(limitInput).toHaveValue(500);
  });

  it("shows correct remaining preview", () => {
    renderModal({ currentLimit: 100, currentRemaining: 42 });
    fireEvent.click(screen.getByText("500"));
    expect(
      screen.getByText((textContent) =>
        textContent.includes("Remaining becomes 442")
      )
    ).toBeInTheDocument();
  });

  it("calls onConfirm with new limit when confirmed", () => {
    const handleConfirm = vi.fn();
    renderModal({ onConfirm: handleConfirm });
    fireEvent.click(screen.getByText("500"));
    fireEvent.click(screen.getByText("Set limit to 500"));
    expect(handleConfirm).toHaveBeenCalledWith(500);
  });
});
