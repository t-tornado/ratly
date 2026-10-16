import { cn } from "../../lib/utils";
import { SectionHeading } from "../SectionHeading";

interface RequestRow {
  time: string;
  method: string;
  path: string;
  status: number;
  xCount?: string;
}

interface RequestsTableProps extends React.ComponentProps<"section"> {
  title?: string;
  rows: RequestRow[];
}

function RequestsTable({
  title = "Recent requests",
  rows,
  className,
  ...props
}: RequestsTableProps) {
  return (
    <section
      aria-label="Recent requests"
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface-raised)] p-4",
        className
      )}
      {...props}
    >
      <SectionHeading>{title}</SectionHeading>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Requests data">
        <table className="w-full border-collapse font-[family-name:var(--font-mono)] text-[13px] min-w-[560px]">
          <thead>
            <tr className="text-left text-[var(--color-text-muted)] text-[12px] uppercase tracking-[0.05em]">
              <th className="py-2 font-medium">Time</th>
              <th className="py-2 font-medium">Request</th>
              <th className="py-2 font-medium">Result</th>
              <th className="py-2 font-medium">x-count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-[var(--color-bg-hover)]"
              >
                <td className="py-2 text-[var(--color-text-muted)]">
                  {row.time}
                </td>
                <td className="py-2">
                  {row.method} {row.path}
                </td>
                <td
                  className={cn(
                    "py-2",
                    row.status >= 400
                      ? "text-[var(--color-error)]"
                      : "text-[var(--color-text-primary)]"
                  )}
                >
                  {row.status}
                </td>
                <td className="py-2 text-[var(--color-text-muted)]">
                  {row.xCount ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export { RequestsTable };
