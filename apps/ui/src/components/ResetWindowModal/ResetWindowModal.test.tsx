import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResetWindowModal } from ".";

const DEFAULT_PROPS = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  userId: "usr_3e88d1",
  currentRemaining: 42,
  currentStatus: "OK",
  limit: 100,
};

function renderModal(
  overrides: Partial<React.ComponentProps<typeof ResetWindowModal>> = {}
) {
  return render(<ResetWindowModal {...DEFAULT_PROPS} {...overrides} />);
}

describe("ResetWindowModal", () => {
  it("renders when open", () => {
    renderModal();
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("shows title with userId", () => {
    renderModal({ userId: "usr_abc123" });
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Reset window for usr_abc123"
    );
  });

  it("shows description text", () => {
    renderModal();
    expect(
      screen.getByText(
        /Ends the current window early\. The user gets the full limit back now/
      )
    ).toBeInTheDocument();
  });

  it("shows NOW and AFTER preview in two-column grid", () => {
    renderModal({ currentRemaining: 42, currentStatus: "OK", limit: 100 });
    expect(screen.getByText("NOW")).toBeInTheDocument();
    expect(screen.getByText("AFTER")).toBeInTheDocument();
    expect(screen.getByText(/42 \/ 100 · OK/)).toBeInTheDocument();
    expect(screen.getByText(/100 \/ 100 · OK/)).toBeInTheDocument();
  });

  it("calls onConfirm when confirm clicked", () => {
    const handleConfirm = vi.fn();
    renderModal({ onConfirm: handleConfirm });
    fireEvent.click(screen.getByText("Reset window"));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it("calls onClose when cancel clicked", () => {
    const handleClose = vi.fn();
    renderModal({ onClose: handleClose });
    fireEvent.click(screen.getByText("Cancel"));
    expect(handleClose).toHaveBeenCalled();
  });
});
