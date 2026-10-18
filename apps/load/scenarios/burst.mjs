// Burst scenario — aggressive traffic to trigger rate limits
// Assumes: 100 req limit / 3600s window per user
// No sleep — each target user exhausts their limit within seconds

import { BASE_URL } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

const TARGET_USERS = RETURNING_USERS.slice(0, 5);
const VUS_PER_USER = 2;

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
  }
}

const vus = TARGET_USERS.flatMap((userId) =>
  Array.from({ length: VUS_PER_USER }, () => userId)
);

console.log(`Starting burst load — ${TARGET_USERS.length} users × ${VUS_PER_USER} VUs each`);
await Promise.all(vus.map((userId) => burstUser(userId)));
