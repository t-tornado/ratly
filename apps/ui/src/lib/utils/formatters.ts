import type { UserRow } from "@ratly/core";
import { DEFAULT_LIMIT } from "@ratly/core";
import { formatTimeWithSeconds, formatRelativeTime, formatCountdown } from "./date";

type StatusVariant = "tag-info" | "tag-warning";

interface RowTag {
  label: string;
  variant: StatusVariant;
}

interface TableRow {
  id: string;
  remaining: number;
  total: number;
  resetTime: string;
  resetIn: string;
  status: "ok" | "warning" | "exceeded";
  statusLabel: string;
  lastRequest: string;
  tags?: RowTag[];
}

function buildRowTags(row: UserRow): RowTag[] {
  const tags: RowTag[] = [];
  if (row.bonus > 0) tags.push({ label: `+${row.bonus} extra`, variant: "tag-info" });
  if (row.limit !== DEFAULT_LIMIT) tags.push({ label: `limit ${row.limit}`, variant: "tag-info" });
  if (row.paused) tags.push({ label: "paused", variant: "tag-warning" });
  return tags;
}

function mapUserRowToTableRow(row: UserRow): TableRow {
  const tags = buildRowTags(row);
  return {
    id: row.userId,
    remaining: row.remaining,
    total: row.allowedTotal,
    resetTime: row.resetAt ? formatTimeWithSeconds(row.resetAt) : "—",
    resetIn: formatCountdown(row.resetAt),
    status: row.status,
    statusLabel: row.status.charAt(0).toUpperCase() + row.status.slice(1),
    lastRequest: formatRelativeTime(row.lastRequestAt),
    tags: tags.length > 0 ? tags : undefined,
  };
}

export { mapUserRowToTableRow, buildRowTags };
export type { TableRow, RowTag };
