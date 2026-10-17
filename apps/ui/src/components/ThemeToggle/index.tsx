import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/hooks";
import { cn } from "../../lib/utils";

type ThemeToggleProps = React.ComponentProps<"button">;

function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-text-primary hover:bg-bg-active transition-colors",
        className,
      )}
      {...props}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export { ThemeToggle, type ThemeToggleProps };
