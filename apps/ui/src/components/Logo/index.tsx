import { cn } from "../../lib/utils";
import { LogoMark } from "./LogoMark";

const WORDMARK_SIZE_RATIO = 0.625;

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

function Logo({ size = 32, showWordmark = false, className }: LogoProps) {
  if (!showWordmark) {
    return <LogoMark size={size} className={className} />;
  }

  const wordmarkFontSize = size * WORDMARK_SIZE_RATIO;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span
        className="font-semibold text-text-primary leading-none"
        style={{ fontSize: wordmarkFontSize }}
      >
        ratly
      </span>
    </div>
  );
}

export { Logo, LogoMark, type LogoProps };
