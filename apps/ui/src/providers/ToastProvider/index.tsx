import { Toaster } from "sonner";

const TOAST_DURATION_MS = 4000;
const TOAST_WIDTH = "420px";

function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      duration={TOAST_DURATION_MS}
      closeButton
      theme="dark"
      toastOptions={{
        style: {
          background: "var(--color-bg-surface-raised)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-default)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          width: TOAST_WIDTH,
        },
        classNames: {
          success: "!border-l-[3px] !border-l-[var(--color-success)]",
          error: "!border-l-[3px] !border-l-[var(--color-error)]",
          closeButton: "!text-[var(--color-text-muted)] hover:!text-[var(--color-text-primary)] !left-auto !right-0",
        },
      }}
    />
  );
}

export { ToastProvider };
