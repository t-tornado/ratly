/**
 * Burst scenario — aggressive traffic to trigger rate limits fast.
 *
 * Targets 10 users with 2 concurrent virtual users each, all firing
 * at 1 req/s. Each user exhausts their 100-request window in ~50s.
 *
 * Assumes: 100 req limit / 3600s window per user.
 *
 * @see RETURNING_USERS — fixed user pool
 * @see BASE_URL — target server
 */

import { BASE_URL } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

const TARGET_USERS = RETURNING_USERS.slice(0, 10);

/** Concurrent virtual users per target user — multiplies request pressure. */
const VUS_PER_USER = 2;

/** Gap between requests per VU — keeps load aggressive but not flooding. */
const REQUEST_GAP_MS = 1_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function hit(userId) {
  const res = await fetch(`${BASE_URL}/test`, {
    headers: { "x-user-id": userId },
  });
  const remaining = res.headers.get("x-count") ?? "?";
  console.log(`[burst] ${userId} → ${res.status}  remaining: ${remaining}`);
}

async function burstUser(userId) {
  while (true) {
    await hit(userId);
    await sleep(REQUEST_GAP_MS);
  }
}

const vus = TARGET_USERS.flatMap((userId) =>
  Array.from({ length: VUS_PER_USER }, () => userId)
);

console.log(
  `Starting burst load — ${TARGET_USERS.length} users x ${VUS_PER_USER} VUs each, ${REQUEST_GAP_MS / 1_000}s between requests`
);
await Promise.all(vus.map((userId) => burstUser(userId)));
