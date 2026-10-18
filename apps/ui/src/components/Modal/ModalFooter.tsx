import { Button } from "../Button";

interface ModalFooterProps {
  onCancel: () => void;
  cancelLabel?: string;
  onConfirm: () => void;
  confirmLabel: string;
  confirmVariant?: "primary" | "accent" | "destructive" | "ghost" | "destructive-ghost" | "warning-ghost";
  isConfirmDisabled?: boolean;
  isConfirmLoading?: boolean;
}

function ModalFooter({
  onCancel,
  cancelLabel = "Cancel",
  onConfirm,
  confirmLabel,
  confirmVariant = "primary",
  isConfirmDisabled = false,
  isConfirmLoading = false,
}: ModalFooterProps) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={isConfirmDisabled}
        isLoading={isConfirmLoading}
      >
        {confirmLabel}
      </Button>
    </>
  );
}

export { ModalFooter };
export type { ModalFooterProps };
