import { Modal, ModalFooter } from "../Modal";

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
          confirmVariant="destructive"
        />
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[var(--text-base-sm)] leading-normal text-[var(--color-text-tertiary)]">
          Ends the current window early. The user gets the full limit back now,
          and a new hour starts with their next request. This can&apos;t be
          undone.
        </p>
        <div className="grid grid-cols-2 gap-2.5 font-[family-name:var(--font-mono)] text-[13px]">
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-base)] p-3">
            <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              NOW
            </span>
            <p className="text-[var(--color-text-primary)]">
              {currentRemaining} / {limit} &middot; {currentStatus}
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-base)] p-3">
            <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              AFTER
            </span>
            <p className="text-[var(--color-accent-blue)]">
              {limit} / {limit} &middot; OK
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
