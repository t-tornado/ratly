import { useState } from "react";

import { cn, formatTime } from "../../lib/utils";
import { Button } from "../Button";
import { Modal, ModalFooter } from "../Modal";

type ThrottlingDuration = "15m" | "1h" | "24h";

interface ThrottlingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration?: ThrottlingDuration) => void;
  userId: string;
  isThrottling: boolean;
  currentRemaining?: number;
  isLoading?: boolean;
}

const DURATION_OPTIONS: {
  value: ThrottlingDuration;
  label: string;
  minutes: number;
}[] = [
  { value: "15m", label: "15 min", minutes: 15 },
  { value: "1h", label: "1 hour", minutes: 60 },
  { value: "24h", label: "24 hours", minutes: 1440 },
];

const DURATION_MINUTES: Record<ThrottlingDuration, number> = {
  "15m": 15,
  "1h": 60,
  "24h": 1440,
};

function formatResumeTime(duration: ThrottlingDuration): string {
  return formatTime(Date.now() + DURATION_MINUTES[duration] * 60 * 1000);
}

function ThrottlingModal({
  isOpen,
  onClose,
  onConfirm,
  userId,
  isThrottling,
  currentRemaining,
  isLoading = false,
}: ThrottlingModalProps) {
  const [selectedDuration, setSelectedDuration] =
    useState<ThrottlingDuration>("1h");

  const title = (
    <>
      {isThrottling ? "Pause" : "Start"} throttling for{" "}
      <span className="font-mono">{userId}</span>
    </>
  );

  const handleConfirm = () => {
    if (isThrottling) {
      onConfirm(selectedDuration);
    } else {
      onConfirm();
    }
  };

  const footer = (
    <ModalFooter
      onCancel={onClose}
      onConfirm={handleConfirm}
      confirmLabel={isThrottling ? "Pause throttling" : "Start throttling"}
      confirmVariant={isThrottling ? "primary" : "accent"}
      isConfirmLoading={isLoading}
    />
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="flex flex-col gap-3.5">
        {isThrottling ? (
          <>
            <p className="text-base-sm text-text-tertiary leading-normal">
              Requests still get counted, but none are rejected. Throttling
              resumes on its own, or early with Resume.
            </p>
            <div className="grid grid-cols-3 gap-2" data-testid="duration-buttons">
              {DURATION_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className={cn(
                    "h-11 rounded-lg",
                    selectedDuration === option.value &&
                      "border-accent-blue bg-bg-active"
                  )}
                  onClick={() => setSelectedDuration(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div
              className="rounded-lg border border-warning-border bg-warning-bg p-3 text-base-sm text-warning-text"
              data-testid="warning-info-box"
            >
              Resumes at {formatResumeTime(selectedDuration)}
            </div>
          </>
        ) : (
          <p className="text-base-sm text-text-tertiary leading-normal">
            Turn throttling back on now. The user has{" "}
            {currentRemaining ?? 0} left in this window; if they're
            already over, further requests are rejected right away.
          </p>
        )}
      </div>
    </Modal>
  );
}

export {
  ThrottlingModal,
  type ThrottlingModalProps,
  type ThrottlingDuration,
};
