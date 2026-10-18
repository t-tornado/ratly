import { useState } from "react";

import { Modal, ModalFooter, ModalPreviewBox } from "../Modal";
import { Button } from "../Button";

const DEFAULT_EXTRA_REQUESTS = 10;
const MIN_EXTRA_REQUESTS = 1;
const STEPPER_INCREMENT = 5;
const PRESET_VALUES = [10, 25, 50] as const;

export interface AddExtraRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (extraRequests: number) => void;
  userId: string;
  currentRemaining: number;
  limit: number;
  isLoading?: boolean;
}

export function AddExtraRequestsModal({
  isOpen,
  onClose,
  onConfirm,
  userId,
  currentRemaining,
  limit,
  isLoading = false,
}: AddExtraRequestsModalProps) {
  const [extraRequests, setExtraRequests] = useState(DEFAULT_EXTRA_REQUESTS);

  function handleDecrement() {
    setExtraRequests((previous) =>
      Math.max(MIN_EXTRA_REQUESTS, previous - STEPPER_INCREMENT)
    );
  }

  function handleIncrement() {
    setExtraRequests((previous) => previous + STEPPER_INCREMENT);
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
          <span className="font-mono">{userId}</span>
        </>
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmLabel={`Add ${extraRequests} requests`}
          confirmVariant="accent"
          isConfirmLoading={isLoading}
        />
      }
    >
      <div className="flex flex-col gap-3.5">
        <p className="text-text-tertiary leading-normal">
          A one-off top-up for this window only. It disappears when the window
          resets; the limit stays {limit}.
        </p>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ghost"
            className="size-11 rounded-lg"
            onClick={handleDecrement}
            aria-label="Decrease by 5"
          >
            -
          </Button>
          <input
            type="number"
            value={extraRequests}
            onChange={handleInputChange}
            min={MIN_EXTRA_REQUESTS}
            aria-label="Extra requests"
            className="h-11 w-[100px] text-center bg-bg-base border border-border-strong rounded-lg font-mono text-2xl text-text-primary"
          />
          <Button
            variant="ghost"
            className="size-11 rounded-lg"
            onClick={handleIncrement}
            aria-label="Increase by 5"
          >
            +
          </Button>
          {PRESET_VALUES.map((presetValue) => (
            <Button
              key={presetValue}
              variant="ghost"
              size="pill"
              className="text-text-tertiary"
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
