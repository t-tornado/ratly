import { randomUUID } from "crypto";

/**
 * Fixed pool of 2000 user IDs.
 *
 * Generated once at startup so the same IDs hit the server repeatedly,
 * exercising the rate-limit window logic. Format: `user_0001`.
 *
 * @see BASE_URL — target server these users hit
 */
export const RETURNING_USERS = Array.from({ length: 2000 }, (_, i) =>
  `user_${String(i + 1).padStart(4, "0")}`
);

/** One-off user ID — for scenarios that need a never-seen-before identity. */
export const freshUserId = () => randomUUID();

/** Pick a random user from the fixed pool. */
export const randomReturningUser = () =>
  RETURNING_USERS[Math.floor(Math.random() * RETURNING_USERS.length)];
