import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
            <ToastContainer
              position="bottom-right"
              autoClose={4000}
              hideProgressBar
              newestOnTop
              closeOnClick
              theme="dark"
            />
          </SocketProvider>
        </ThemeProvider>
      </QueryProvider>
    </StrictMode>
  </ErrorBoundary>,
);
