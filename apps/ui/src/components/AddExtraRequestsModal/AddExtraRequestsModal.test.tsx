import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { AddExtraRequestsModal } from ".";

function renderModal(
  props: Partial<React.ComponentProps<typeof AddExtraRequestsModal>> = {}
) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    userId: "usr_abc123",
    currentRemaining: 50,
  };
  return render(<AddExtraRequestsModal {...defaultProps} {...props} />);
}

describe("AddExtraRequestsModal", () => {
  it("renders when open", () => {
    renderModal();
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("shows title with userId", () => {
    renderModal({ userId: "usr_xyz789" });
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Add extra requests for usr_xyz789"
    );
  });

  it("shows stepper with default value", () => {
    renderModal();
    const stepperInput = screen.getByLabelText("Extra requests");
    expect(stepperInput).toHaveValue(10);
  });

  it("increments value when plus clicked", () => {
    renderModal();
    const increaseButton = screen.getByLabelText("Increase");
    fireEvent.click(increaseButton);
    expect(screen.getByLabelText("Extra requests")).toHaveValue(11);
  });

  it("decrements value when minus clicked", () => {
    renderModal();
    const decreaseButton = screen.getByLabelText("Decrease");
    const increaseButton = screen.getByLabelText("Increase");
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    fireEvent.click(decreaseButton);
    expect(screen.getByLabelText("Extra requests")).toHaveValue(11);
  });

  it("does not decrement below 1", () => {
    renderModal();
    const decreaseButton = screen.getByLabelText("Decrease");
    for (let i = 0; i < 20; i++) {
      fireEvent.click(decreaseButton);
    }
    expect(screen.getByLabelText("Extra requests")).toHaveValue(1);
  });

  it("shows preview with correct remaining calculation", () => {
    renderModal({ currentRemaining: 42 });
    expect(screen.getByText(/Remaining 42/)).toBeInTheDocument();
    expect(screen.getByText(/52/)).toBeInTheDocument();
  });

  it("calls onConfirm with current value when confirmed", () => {
    const handleConfirm = vi.fn();
    renderModal({ onConfirm: handleConfirm });
    const confirmButton = screen.getByText("Add 10 requests");
    fireEvent.click(confirmButton);
    expect(handleConfirm).toHaveBeenCalledWith(10);
  });

  it("preset buttons set correct values", () => {
    renderModal({ currentRemaining: 20 });
    const stepperInput = screen.getByLabelText("Extra requests");

    fireEvent.click(screen.getByText("+10"));
    expect(stepperInput).toHaveValue(10);

    fireEvent.click(screen.getByText("+50"));
    expect(stepperInput).toHaveValue(50);

    fireEvent.click(screen.getByText("+100"));
    expect(stepperInput).toHaveValue(100);
  });
});
