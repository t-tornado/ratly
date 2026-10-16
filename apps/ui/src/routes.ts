export const routes = {
  dashboard: "/",
  userDetail: (userId: string) => `/users/${userId}`,
} as const;
