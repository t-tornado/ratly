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
  info: "text-accent-purple",
  warning: "text-warning",
  error: "text-error",
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
        "rounded-xl border border-border-default bg-bg-surface-raised p-4",
        className
      )}
      {...props}
    >
      <SectionHeading>{title}</SectionHeading>
      <div className="flex flex-col gap-0 max-h-80 md:max-h-[calc(100vh-12rem)] overflow-y-auto" tabIndex={0}>
        {events.map((event, i) => (
          <div
            key={i}
            className="py-2 border-t border-bg-hover font-mono text-sm"
          >
            <div className="flex items-center justify-between">
              <span className={severityColor[event.severity ?? "info"]}>
                {event.type}
              </span>
              <span className="text-text-muted">
                {event.timestamp}
              </span>
            </div>
            <div className="text-text-secondary mt-0.5">
              {event.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { EventStream, type StreamEvent };
