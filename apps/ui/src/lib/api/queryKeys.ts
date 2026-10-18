export const queryKeys = {
  dashboard: ["dashboard"] as const,
  user: (userId: string) => ["user", userId] as const,
};
