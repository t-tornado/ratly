import { cn } from "../../lib/utils";
import { SectionHeading } from "../SectionHeading";

interface StreamEvent {
  type: string;
  timestamp: string;
  description: string;
  severity?: "info" | "warning" | "error";
}

interface EventStreamProps extends React.ComponentProps<"section"> {
  title: string;
  events: StreamEvent[];
}

const severityColor: Record<string, string> = {
  info: "text-[var(--color-accent-purple)]",
  warning: "text-[var(--color-warning)]",
  error: "text-[var(--color-error)]",
};

function EventStream({
  title,
  events,
  className,
  ...props
}: EventStreamProps) {
  return (
    <section
      aria-label="Live events for this user"
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface-raised)] p-4",
        className
      )}
      {...props}
    >
      <SectionHeading>{title}</SectionHeading>
      <div className="flex flex-col gap-0">
        {events.map((event, i) => (
          <div
            key={i}
            className="py-2 border-t border-[var(--color-bg-hover)] font-[family-name:var(--font-mono)] text-[12px]"
          >
            <div className="flex items-center justify-between">
              <span className={severityColor[event.severity ?? "info"]}>
                {event.type}
              </span>
              <span className="text-[var(--color-text-muted)]">
                {event.timestamp}
              </span>
            </div>
            <div className="text-[var(--color-text-secondary)] mt-0.5">
              {event.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { EventStream };
