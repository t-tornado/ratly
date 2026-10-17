import { cn } from "../../lib/utils";
import { SectionHeading } from "../SectionHeading";
import { ProgressBar } from "../ProgressBar";

interface TopUser {
  id: string;
  requests: number;
  max: number;
}

interface TopUsersChartProps extends React.ComponentProps<"section"> {
  title?: string;
  users: TopUser[];
}

function TopUsersChart({
  title = "Top users · current window",
  users,
  className,
  ...props
}: TopUsersChartProps) {
  return (
    <section
      aria-label="Top users"
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised p-4",
        className
      )}
      {...props}
    >
      <SectionHeading>{title}</SectionHeading>
      {users.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-[110px_1fr_64px] items-center gap-2.5 py-1.5 font-mono text-sm"
        >
          <span className="text-text-secondary truncate">
            {user.id}
          </span>
          <ProgressBar
            value={user.requests}
            max={user.max}
            variant="exceeded"
            barSize="md"
          />
          <span className="text-right text-text-muted">
            {user.requests} req
          </span>
        </div>
      ))}
    </section>
  );
}

export { TopUsersChart, type TopUsersChartProps, type TopUser };
