import { randomUUID } from "crypto";

export const RETURNING_USERS = Array.from({ length: 50 }, (_, i) =>
  `user-${String(i + 1).padStart(3, "0")}`
);

export const freshUserId = () => randomUUID();

export const randomReturningUser = () =>
  RETURNING_USERS[Math.floor(Math.random() * RETURNING_USERS.length)];
