import { cn } from "../../lib/utils";
import { SectionHeading } from "../SectionHeading";

interface LiveEvent {
  time: string;
  type: string;
  description: string;
  severity?: "info" | "warning" | "error";
}

interface LiveEventsFeedProps extends React.ComponentProps<"section"> {
  title?: string;
  events: LiveEvent[];
}

const severityColor: Record<string, string> = {
  info: "text-accent-purple",
  warning: "text-warning",
  error: "text-error",
};

function LiveEventsFeed({
  title = "Live events",
  events,
  className,
  ...props
}: LiveEventsFeedProps) {
  return (
    <section
      aria-label="Live events"
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised p-4",
        className
      )}
      {...props}
    >
      <SectionHeading>{title}</SectionHeading>
      {events.map((event, i) => (
        <div
          key={i}
          className="grid grid-cols-[64px_1fr] gap-2.5 py-[7px] border-t border-bg-hover font-mono text-sm"
        >
          <span className="text-text-muted">{event.time}</span>
          <div>
            <span className={severityColor[event.severity ?? "info"]}>
              {event.type}
            </span>
            <span className="text-text-secondary ml-2">
              {event.description}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

export { LiveEventsFeed, type LiveEventsFeedProps, type LiveEvent };
