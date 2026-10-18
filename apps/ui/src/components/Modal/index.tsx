import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "../Dialog";
import { cn } from "../../lib/utils";
import { Button } from "../Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="modal">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">{title}</DialogTitle>
        </DialogHeader>
        <DialogBody data-testid="modal-body">{children}</DialogBody>
        {footer && (
          <DialogFooter data-testid="modal-footer">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ModalFooterProps {
  onCancel: () => void;
  cancelLabel?: string;
  onConfirm: () => void;
  confirmLabel: string;
  confirmVariant?: "primary" | "accent" | "destructive" | "ghost" | "destructive-ghost" | "warning-ghost";
  isConfirmDisabled?: boolean;
}

function ModalFooter({
  onCancel,
  cancelLabel = "Cancel",
  onConfirm,
  confirmLabel,
  confirmVariant = "primary",
  isConfirmDisabled = false,
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
      >
        {confirmLabel}
      </Button>
    </>
  );
}

interface ModalPreviewBoxProps {
  children: React.ReactNode;
  className?: string;
}

function ModalPreviewBox({ children, className }: ModalPreviewBoxProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-strong bg-bg-base px-3 py-2.5 text-base-sm text-text-secondary",
        className
      )}
    >
      {children}
    </div>
  );
}

export {
  Modal,
  ModalFooter,
  ModalPreviewBox,
  type ModalProps,
  type ModalFooterProps,
  type ModalPreviewBoxProps,
};
