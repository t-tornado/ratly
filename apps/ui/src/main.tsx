import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./styles/index.css";
import { QueryProvider } from "./providers/query";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SocketProvider } from "./providers/SocketProvider";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <StrictMode>
      <QueryProvider>
        <ThemeProvider>
          <SocketProvider>
            <App />
            <Toaster
              position="bottom-right"
              duration={4000}
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
                  width: "420px",
                },
                classNames: {
                  success: "!bg-[var(--color-success-bg)] !text-[var(--color-success-text)] !border-l-[3px] !border-l-[var(--color-success)]",
                  error: "!bg-[var(--color-error-bg)] !text-[var(--color-error-text)] !border-l-[3px] !border-l-[var(--color-error)]",
                  closeButton: "!text-[var(--color-text-muted)] hover:!text-[var(--color-text-primary)]",
                },
              }}
            />
          </SocketProvider>
        </ThemeProvider>
      </QueryProvider>
    </StrictMode>
  </ErrorBoundary>,
);
