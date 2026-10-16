import { createContext, useContext } from "react";
import { ContextNotFoundError } from "../errors";
import type { ThemeContext as ThemeContextType } from "../types";

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new ContextNotFoundError({ hookName: "useTheme", providerName: "ThemeProvider" });
  }

  return context;
}
