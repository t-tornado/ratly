import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
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
          </SocketProvider>
        </ThemeProvider>
      </QueryProvider>
    </StrictMode>
  </ErrorBoundary>,
);
