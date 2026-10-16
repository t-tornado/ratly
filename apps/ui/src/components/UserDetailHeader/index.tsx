import { cn } from "../../lib/utils";
import { Badge, type BadgeProps } from "../Badge";
import { StatusDot } from "../StatusDot";
import { Button } from "../Button";

interface ActionButton {
  label: string;
  variant?: "ghost" | "primary" | "destructive-ghost";
  onClick?: () => void;
}

interface UserDetailHeaderProps extends React.ComponentProps<"div"> {
  backHref?: string;
  userId: string;
  status: BadgeProps["variant"];
  statusLabel: string;
  streaming?: boolean;
  actions?: ActionButton[];
}

function UserDetailHeader({
  backHref,
  userId,
  status,
  statusLabel,
  streaming = false,
  actions = [],
  className,
  ...props
}: UserDetailHeaderProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3.5", className)}
      {...props}
    >
      {backHref && (
        <a
          href={backHref}
          className="no-underline text-[var(--color-text-secondary)] text-[13px]"
        >
          ← Users
        </a>
      )}
      <h1 className="m-0 font-[family-name:var(--font-mono)] text-[24px] font-semibold">
        {userId}
      </h1>
      <Badge variant={status}>{statusLabel}</Badge>
      {streaming && (
        <span className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--color-success-text)] flex items-center gap-1.5">
          <StatusDot variant="live" pulsating />
          streaming
        </span>
      )}
      <div className="flex-1" />
      {actions.length > 0 && (
        <div
          role="group"
          aria-label="Admin actions"
          className="flex flex-wrap gap-2"
        >
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? "ghost"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export { UserDetailHeader };
