import { Clock } from "lucide-react";
import { cn } from "../../lib/utils";
import type { StreamEvent } from "../../lib/types";
import { SectionHeading } from "../SectionHeading";

interface EventStreamProps extends React.ComponentProps<"section"> {
  title: string;
  events: StreamEvent[];
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
}

const SEVERITY_DOT_COLOR: Record<string, string> = {
  info: "bg-accent-purple",
  warning: "bg-warning",
  error: "bg-error",
};

const SEVERITY_TEXT_COLOR: Record<string, string> = {
  info: "text-accent-purple",
  warning: "text-warning",
  error: "text-error",
};

function EventStream({
  title,
  events,
  headerRight,
  footer,
  className,
  ...props
}: EventStreamProps) {
  return (
    <section
      aria-label="Live events for this user"
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised p-4 overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <SectionHeading className="mb-0">{title}</SectionHeading>
        {headerRight}
      </div>
      <div className="flex flex-col gap-0 flex-1 min-h-0 overflow-y-auto" tabIndex={0}>
        {events.map((event, index) => {
          const severity = event.severity ?? "info";
          return (
            <div
              key={event.id}
              className={cn(
                "py-2.5 font-mono text-sm",
                index > 0 && "border-t border-border-default"
              )}
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-2 min-w-0">
                  <span className={cn("inline-block w-1.5 h-1.5 rounded-full shrink-0", SEVERITY_DOT_COLOR[severity])} />
                  <span className={cn("font-medium truncate", SEVERITY_TEXT_COLOR[severity])}>
                    {event.type}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs text-text-muted tabular-nums shrink-0">
                  <Clock size={10} />
                  {event.timestamp}
                </span>
              </div>
              <div className="text-text-muted text-xs mt-1 pl-3.5 break-words">
                {event.description}
              </div>
            </div>
          );
        })}
      </div>
      {footer && (
        <div className="pt-3 mt-auto border-t border-border-default">
          {footer}
        </div>
      )}
    </section>
  );
}

export { EventStream };
