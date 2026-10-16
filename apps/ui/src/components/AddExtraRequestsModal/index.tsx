import { useState } from "react";

import { Modal, ModalFooter, ModalPreviewBox } from "../Modal";
import { Button } from "../Button";

const DEFAULT_EXTRA_REQUESTS = 10;
const MIN_EXTRA_REQUESTS = 1;
const PRESET_VALUES = [10, 50, 100] as const;

export interface AddExtraRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (extraRequests: number) => void;
  userId: string;
  currentRemaining: number;
}

export function AddExtraRequestsModal({
  isOpen,
  onClose,
  onConfirm,
  userId,
  currentRemaining,
}: AddExtraRequestsModalProps) {
  const [extraRequests, setExtraRequests] = useState(DEFAULT_EXTRA_REQUESTS);

  function handleDecrement() {
    setExtraRequests((previous) =>
      Math.max(MIN_EXTRA_REQUESTS, previous - 1)
    );
  }

  function handleIncrement() {
    setExtraRequests((previous) => previous + 1);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const parsedValue = parseInt(event.target.value, 10);
    if (!isNaN(parsedValue) && parsedValue >= MIN_EXTRA_REQUESTS) {
      setExtraRequests(parsedValue);
    }
  }

  function handlePreset(presetValue: number) {
    setExtraRequests(presetValue);
  }

  function handleConfirm() {
    onConfirm(extraRequests);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Add extra requests for{" "}
          <span className="font-[family-name:var(--font-mono)]">{userId}</span>
        </>
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmLabel={`Add ${extraRequests} requests`}
          confirmVariant="primary"
        />
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            className="size-11 rounded-[var(--radius-lg)]"
            onClick={handleDecrement}
            aria-label="Decrease"
          >
            -
          </Button>
          <input
            type="number"
            value={extraRequests}
            onChange={handleInputChange}
            min={MIN_EXTRA_REQUESTS}
            aria-label="Extra requests"
            className="h-11 w-[100px] text-center bg-[var(--color-bg-base)] border border-[var(--color-border-strong)] rounded-[var(--radius-lg)] font-[family-name:var(--font-mono)] text-[var(--text-2xl)] text-[var(--color-text-primary)]"
          />
          <Button
            variant="ghost"
            className="size-11 rounded-[var(--radius-lg)]"
            onClick={handleIncrement}
            aria-label="Increase"
          >
            +
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2">
          {PRESET_VALUES.map((presetValue) => (
            <Button
              key={presetValue}
              variant="ghost"
              size="compact"
              onClick={() => handlePreset(presetValue)}
            >
              +{presetValue}
            </Button>
          ))}
        </div>

        <ModalPreviewBox>
          Remaining {currentRemaining} &rarr;{" "}
          {currentRemaining + extraRequests}
        </ModalPreviewBox>
      </div>
    </Modal>
  );
}
