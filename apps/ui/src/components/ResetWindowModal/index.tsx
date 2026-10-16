import { Modal, ModalFooter, ModalPreviewBox } from "../Modal";

export interface ResetWindowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userId: string;
  currentRemaining: number;
  currentStatus: string;
  limit: number;
}

export function ResetWindowModal({
  isOpen,
  onClose,
  onConfirm,
  userId,
  currentRemaining,
  currentStatus,
  limit,
}: ResetWindowModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Reset window for{" "}
          <span className="font-[family-name:var(--font-mono)]">{userId}</span>
        </>
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={onConfirm}
          confirmLabel="Reset window"
          confirmVariant="warning-ghost"
        />
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-[var(--text-base-sm)] text-[var(--color-text-secondary)]">
          Ends the current window early. The user gets the full limit back now,
          and a new hour starts with their next request. This can&apos;t be
          undone.
        </p>
        <ModalPreviewBox>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-muted)]">NOW</span>
              <span className="text-[var(--color-text-primary)]">
                {currentRemaining} &middot; {currentStatus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-muted)]">AFTER</span>
              <span className="text-[var(--color-text-primary)]">
                {limit} / {limit} &middot; OK
              </span>
            </div>
          </div>
        </ModalPreviewBox>
      </div>
    </Modal>
  );
}
