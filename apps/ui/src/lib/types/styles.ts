type Theme = "light" | "dark" | "system";

type ResolvedTheme = "light" | "dark";

interface ThemeContext {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export type { Theme, ResolvedTheme, ThemeContext };
