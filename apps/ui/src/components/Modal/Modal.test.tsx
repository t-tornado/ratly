import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal, ModalFooter, ModalPreviewBox } from ".";

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: "Test Modal",
    children: <p>Body content</p>,
  };
  return render(<Modal {...defaultProps} {...props} />);
}

describe("Modal", () => {
  it("renders when open", () => {
    renderModal();
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("shows title", () => {
    renderModal({ title: "My Title" });
    expect(screen.getByTestId("modal-title")).toHaveTextContent("My Title");
  });

  it("shows body content", () => {
    renderModal({ children: <p>Hello world</p> });
    expect(screen.getByTestId("modal-body")).toHaveTextContent("Hello world");
  });

  it("shows footer when provided", () => {
    renderModal({
      footer: (
        <ModalFooter
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
          confirmLabel="OK"
        />
      ),
    });
    expect(screen.getByTestId("modal-footer")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("hides footer when not provided", () => {
    renderModal({ footer: undefined });
    expect(screen.queryByTestId("modal-footer")).not.toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const handleClose = vi.fn();
    renderModal({ onClose: handleClose });
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });
});

describe("ModalFooter", () => {
  it("renders cancel and confirm buttons", () => {
    render(
      <ModalFooter
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        confirmLabel="Apply"
      />
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    const handleConfirm = vi.fn();
    render(
      <ModalFooter
        onCancel={vi.fn()}
        onConfirm={handleConfirm}
        confirmLabel="Save"
      />
    );
    fireEvent.click(screen.getByText("Save"));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it("disables confirm button when isConfirmDisabled", () => {
    render(
      <ModalFooter
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        confirmLabel="Save"
        isConfirmDisabled
      />
    );
    expect(screen.getByText("Save")).toBeDisabled();
  });
});

describe("ModalPreviewBox", () => {
  it("renders children", () => {
    render(<ModalPreviewBox>Preview text</ModalPreviewBox>);
    expect(screen.getByText("Preview text")).toBeInTheDocument();
  });
});
