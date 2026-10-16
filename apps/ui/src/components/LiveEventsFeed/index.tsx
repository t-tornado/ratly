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
  info: "text-[var(--color-accent-purple)]",
  warning: "text-[var(--color-warning)]",
  error: "text-[var(--color-error)]",
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
        "rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface-raised)] p-4",
        className
      )}
      {...props}
    >
      <SectionHeading>{title}</SectionHeading>
      {events.map((event, i) => (
        <div
          key={i}
          className="grid grid-cols-[64px_1fr] gap-2.5 py-[7px] border-t border-[var(--color-bg-hover)] font-[family-name:var(--font-mono)] text-[12px]"
        >
          <span className="text-[var(--color-text-muted)]">{event.time}</span>
          <div>
            <span className={severityColor[event.severity ?? "info"]}>
              {event.type}
            </span>
            <span className="text-[var(--color-text-secondary)] ml-2">
              {event.description}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

export { LiveEventsFeed, type LiveEventsFeedProps, type LiveEvent };
