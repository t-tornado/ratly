import { useState } from "react";

import { Modal, ModalFooter, ModalPreviewBox } from "../Modal";
import { Button } from "../Button";
import { cn } from "../../lib/utils";

interface PresetLimit {
  value: number;
  label: string;
}

const PRESET_LIMITS: readonly PresetLimit[] = [
  { value: 50, label: "50" },
  { value: 100, label: "100 \u00b7 default" },
  { value: 150, label: "150" },
  { value: 500, label: "500" },
] as const;

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
          <span className="font-mono">{userId}</span>
        </>
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmLabel={`Set limit to ${limitValue}`}
          confirmVariant="accent"
        />
      }
    >
      <div className="flex flex-col gap-3.5">
        <label htmlFor="adjust-limit-input" className="text-base-sm text-text-secondary">
          Requests per hour (now {currentLimit})
        </label>

        <input
          id="adjust-limit-input"
          type="number"
          data-testid="limit-input"
          value={limitValue}
          onChange={handleInputChange}
          className="h-11 w-full bg-bg-base border border-border-strong focus:border-accent-blue rounded-lg font-mono text-2xl text-text-primary px-3 outline-none"
        />

        <div className="flex gap-2">
          {PRESET_LIMITS.map((preset) => (
            <Button
              key={preset.value}
              variant="ghost"
              size="pill"
              className={cn(
                limitValue === preset.value &&
                  "border-accent-blue bg-bg-active"
              )}
              onClick={() => handlePresetClick(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <ModalPreviewBox>
          Remaining becomes{" "}
          <span className="text-accent-blue">
            {newRemaining} / {limitValue}
          </span>{" "}
          &middot; {remainingStatus}
        </ModalPreviewBox>
      </div>
    </Modal>
  );
}

export { AdjustLimitModal };
