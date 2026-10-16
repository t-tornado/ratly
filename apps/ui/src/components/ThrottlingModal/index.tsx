import { useState } from "react";

import { cn } from "../../lib/utils";
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
  const resumeDate = new Date(
    Date.now() + DURATION_MINUTES[duration] * 60 * 1000
  );
  return resumeDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ThrottlingModal({
  isOpen,
  onClose,
  onConfirm,
  userId,
  isThrottling,
  currentRemaining,
}: ThrottlingModalProps) {
  const [selectedDuration, setSelectedDuration] =
    useState<ThrottlingDuration>("1h");

  const title = (
    <>
      {isThrottling ? "Pause" : "Resume"} throttling for{" "}
      <span className="font-[family-name:var(--font-mono)]">{userId}</span>
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
      confirmLabel={isThrottling ? "Pause throttling" : "Resume throttling"}
      confirmVariant={isThrottling ? "primary" : "accent"}
    />
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="flex flex-col gap-3.5">
        {isThrottling ? (
          <>
            <p className="text-[length:var(--text-base-sm)] text-[color:var(--color-text-tertiary)] leading-normal">
              Requests still get counted, but none are rejected. Throttling
              resumes on its own, or early with Resume.
            </p>
            <div className="grid grid-cols-3 gap-2" data-testid="duration-buttons">
              {DURATION_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className={cn(
                    "h-11 rounded-[var(--radius-lg)]",
                    selectedDuration === option.value &&
                      "border-[var(--color-accent-blue)] bg-[var(--color-bg-active)]"
                  )}
                  onClick={() => setSelectedDuration(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-3 text-[length:var(--text-base-sm)] text-[color:var(--color-warning-text)]"
              data-testid="warning-info-box"
            >
              Resumes at {formatResumeTime(selectedDuration)}
            </div>
          </>
        ) : (
          <p className="text-[length:var(--text-base-sm)] text-[color:var(--color-text-tertiary)] leading-normal">
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
