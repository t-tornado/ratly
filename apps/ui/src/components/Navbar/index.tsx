import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { Badge } from "../Badge";
import { StatusDot } from "../StatusDot";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps extends React.ComponentProps<"header"> {
  env?: string;
  links: NavLink[];
  connected?: boolean;
  configText?: string;
}

function Navbar({
  env = "prod",
  links,
  connected = true,
  configText,
  className,
  ...props
}: NavbarProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center gap-4 px-7 py-3.5 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        <Icon
          variant="activity-pulse"
          size={22}
          className="text-[var(--color-accent-blue)]"
        />
        <span className="font-bold text-[17px] tracking-[var(--tracking-tight)]">
          ratly
        </span>
        <Badge variant="env">{env}</Badge>
      </div>

      <nav aria-label="Primary" className="flex gap-1 flex-wrap">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={cn(
              "no-underline px-3 py-2 rounded-[var(--radius-lg)] text-sm",
              link.active
                ? "text-[var(--color-text-primary)] bg-[var(--color-bg-active)] font-medium"
                : "text-[var(--color-text-secondary)]"
            )}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex-1" />

      {connected && (
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--color-success-text)]">
          <StatusDot variant="live" pulsating />
          LIVE · ws connected
        </div>
      )}

      {configText && (
        <span className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--color-text-secondary)]">
          {configText}
        </span>
      )}
    </header>
  );
}

export { Navbar };
