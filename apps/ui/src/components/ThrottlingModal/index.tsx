import { useState } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../Button";
import { Modal, ModalFooter } from "../Modal";

type ThrottlingDuration = "30m" | "1h" | "4h";

interface ThrottlingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration?: ThrottlingDuration) => void;
  userId: string;
  isThrottling: boolean;
  currentRemaining?: number;
}

const DURATION_OPTIONS: { value: ThrottlingDuration; label: string }[] = [
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
];

const DURATION_MINUTES: Record<ThrottlingDuration, number> = {
  "30m": 30,
  "1h": 60,
  "4h": 240,
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
      confirmVariant={isThrottling ? "warning-ghost" : "primary"}
    />
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="flex flex-col gap-3">
        {isThrottling ? (
          <>
            <p className="text-[var(--text-base-sm)] text-[var(--color-text-secondary)]">
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
                      "bg-[var(--color-bg-active)]"
                  )}
                  onClick={() => setSelectedDuration(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-3 text-[var(--text-base-sm)] text-[var(--color-warning-text)]"
              data-testid="warning-info-box"
            >
              Resumes at {formatResumeTime(selectedDuration)}
            </div>
          </>
        ) : (
          <p className="text-[var(--text-base-sm)] text-[var(--color-text-secondary)]">
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
