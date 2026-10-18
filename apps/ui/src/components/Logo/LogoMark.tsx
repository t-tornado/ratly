import { cn } from "../../lib/utils";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Ratly logo"
    >
      <rect width="64" height="64" rx="14" style={{ fill: "var(--color-bg-base)" }} />
      <rect x="10.75" y="41" width="8" height="10" rx="2" style={{ fill: "var(--color-accent-blue)" }} />
      <rect x="22.25" y="31" width="8" height="20" rx="2" style={{ fill: "var(--color-accent-blue)" }} />
      <rect x="33.75" y="22" width="8" height="29" rx="2" style={{ fill: "var(--color-accent-blue)" }} />
      <rect x="45.25" y="22" width="8" height="29" rx="2" style={{ fill: "var(--color-accent-blue)" }} />
      <rect x="8.75" y="13" width="46.5" height="5" rx="2.5" style={{ fill: "var(--color-warning)" }} />
    </svg>
  );
}

export { LogoMark };
export type { LogoMarkProps };
