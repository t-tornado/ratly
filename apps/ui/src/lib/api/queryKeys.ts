export const queryKeys = {
  dashboard: ["dashboard"] as const,
  user: (userId: string) => ["user", userId] as const,
  activity: (userId: string, range: string) => ["activity", userId, range] as const,
};
