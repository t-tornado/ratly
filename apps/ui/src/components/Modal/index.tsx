import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "../Dialog";

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

export { Modal, type ModalProps };
export { ModalFooter, type ModalFooterProps } from "./ModalFooter";
export { ModalPreviewBox, type ModalPreviewBoxProps } from "./ModalPreviewBox";
