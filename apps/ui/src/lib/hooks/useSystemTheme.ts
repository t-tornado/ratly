import { useEffect, useState } from "react";
import type { ResolvedTheme } from "../types";
import { getSystemTheme } from "../utils/theme";

export function useSystemTheme(): ResolvedTheme {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange() {
      setSystemTheme(getSystemTheme());
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return systemTheme;
}
