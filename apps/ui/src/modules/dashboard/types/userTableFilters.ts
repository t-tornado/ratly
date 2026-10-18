export type UserStatusFilter = "All" | "OK" | "Warning" | "Exceeded";

export type TimeWindowFilter = "any" | "1h" | "24h";

export interface UserTableFilterState {
  statusFilter: UserStatusFilter;
  searchQuery: string;
  windowFilter: TimeWindowFilter;
}
