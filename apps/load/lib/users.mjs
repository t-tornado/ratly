import { randomUUID } from "crypto";

const shortId = () => randomUUID().slice(0, 4);

/**
 * Fixed pool of 2000 user IDs with random suffixes.
 *
 * Generated once at startup so the same IDs hit the server repeatedly,
 * exercising the rate-limit window logic. Format: `user_0001_ab3f`.
 *
 * @see BASE_URL — target server these users hit
 */
export const RETURNING_USERS = Array.from({ length: 2000 }, (_, i) =>
  `user_${String(i + 1).padStart(4, "0")}_${shortId()}`
);

/** One-off user ID — for scenarios that need a never-seen-before identity. */
export const freshUserId = () => randomUUID();

/** Pick a random user from the fixed pool. */
export const randomReturningUser = () =>
  RETURNING_USERS[Math.floor(Math.random() * RETURNING_USERS.length)];
