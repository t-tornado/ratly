import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { QueryProvider } from "./providers/query";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);
