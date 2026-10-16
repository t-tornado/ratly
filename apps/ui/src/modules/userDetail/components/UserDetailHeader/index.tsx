import { Link } from "react-router-dom";
import { routes } from "../../../../routes";
import { PageHeader } from "../../../../components/PageHeader";
import { Badge, type BadgeProps } from "../../../../components/Badge";
import { Button } from "../../../../components/Button";
import { StatusDot } from "../../../../components/StatusDot";

interface ActionButton {
  label: string;
  variant?: "ghost" | "primary" | "destructive-ghost";
  onClick?: () => void;
}

interface UserDetailHeaderProps {
  userId: string;
  status: BadgeProps["variant"];
  statusLabel: string;
  isStreaming?: boolean;
  actions?: ActionButton[];
}

function UserDetailHeader({
  userId,
  status,
  statusLabel,
  isStreaming = false,
  actions = [],
}: UserDetailHeaderProps) {
  return (
    <div data-testid="user-detail-header">
      <PageHeader
        rightSlot={
          actions.length > 0 ? (
            <div
              data-testid="admin-actions"
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
          ) : undefined
        }
      >
        <Link
          to={routes.dashboard}
          className="no-underline text-[var(--color-text-secondary)] text-[13px]"
        >
          ← Users
        </Link>
        <h1
          data-testid="user-id"
          className="m-0 font-[family-name:var(--font-mono)] text-[24px] font-semibold"
        >
          {userId}
        </h1>
        <Badge variant={status}>{statusLabel}</Badge>
        {isStreaming && (
          <span className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--color-success-text)] flex items-center gap-1.5">
            <StatusDot variant="live" pulsating />
            streaming
          </span>
        )}
      </PageHeader>
    </div>
  );
}

export { UserDetailHeader, type UserDetailHeaderProps, type ActionButton };
