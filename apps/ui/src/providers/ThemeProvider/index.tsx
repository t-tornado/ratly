import { useCallback, useEffect, useState } from "react";
import { useSystemTheme } from "../../lib/hooks";
import { ThemeContext } from "../../lib/hooks/useTheme";
import { safeLocalStorage } from "../../lib/safeLocalStorage";
import { STORAGE_KEYS } from "../../lib/safeLocalStorage/keys";
import type { ResolvedTheme, Theme } from "../../lib/types";

const THEME_META_COLORS: Record<ResolvedTheme, string> = {
  dark: "#0E1116",
  light: "#FAFBFC",
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => safeLocalStorage.get<Theme>(STORAGE_KEYS.theme) ?? "system",
  );

  const systemTheme = useSystemTheme();
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolvedTheme);

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) {
      meta.content = THEME_META_COLORS[resolvedTheme];
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    safeLocalStorage.set(STORAGE_KEYS.theme, newTheme);
  }, []);

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext>
  );
}

export type { ThemeProviderProps };
