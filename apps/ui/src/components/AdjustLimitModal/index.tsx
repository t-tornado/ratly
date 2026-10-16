import { useState } from "react";

import { Modal, ModalFooter, ModalPreviewBox } from "../Modal";
import { Button } from "../Button";
import { cn } from "../../lib/utils";

const PRESET_LIMITS = [50, 100, 500, 1000] as const;

export interface AdjustLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newLimit: number) => void;
  userId: string;
  currentLimit: number;
  currentRemaining: number;
}

function AdjustLimitModal({
  isOpen,
  onClose,
  onConfirm,
  userId,
  currentLimit,
  currentRemaining,
}: AdjustLimitModalProps) {
  const [limitValue, setLimitValue] = useState(currentLimit);

  const newRemaining = Math.max(
    0,
    currentRemaining + (limitValue - currentLimit)
  );
  const remainingStatus = newRemaining > 0 ? "OK" : "Exceeded";

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseInt(event.target.value, 10);
    setLimitValue(Number.isNaN(parsed) ? 0 : parsed);
  }

  function handlePresetClick(preset: number) {
    setLimitValue(preset);
  }

  function handleConfirm() {
    onConfirm(limitValue);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Adjust limit for{" "}
          <span className="font-[family-name:var(--font-mono)]">{userId}</span>
        </>
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmLabel={`Set limit to ${limitValue}`}
          confirmVariant="primary"
        />
      }
    >
      <div className="flex flex-col gap-3">
        <label className="text-[var(--text-base-sm)] text-[var(--color-text-secondary)]">
          Requests per hour (now {currentLimit})
        </label>

        <input
          type="number"
          data-testid="limit-input"
          value={limitValue}
          onChange={handleInputChange}
          className="h-11 w-full bg-[var(--color-bg-base)] border border-[var(--color-border-strong)] focus:border-[var(--color-accent-blue)] rounded-[var(--radius-lg)] font-[family-name:var(--font-mono)] text-[var(--text-2xl)] text-[var(--color-text-primary)] px-3 outline-none"
        />

        <div className="flex gap-2">
          {PRESET_LIMITS.map((preset) => (
            <Button
              key={preset}
              variant="ghost"
              size="compact"
              className={cn(
                limitValue === preset && "bg-[var(--color-bg-active)]"
              )}
              onClick={() => handlePresetClick(preset)}
            >
              {preset}
            </Button>
          ))}
        </div>

        <ModalPreviewBox>
          Remaining becomes {newRemaining} &middot; {remainingStatus}
        </ModalPreviewBox>
      </div>
    </Modal>
  );
}

export { AdjustLimitModal };
