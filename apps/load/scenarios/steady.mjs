// Steady scenario — paced traffic, stays under rate limit
// Assumes: 100 req limit / 3600s window per user
// At 5s sleep per VU: safe for demo runs up to ~8 minutes (96 req/user)

import { BASE_URL } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

const VU_COUNT = 20;
const SLEEP_MS = 5_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function hit(userId) {
  const res = await fetch(`${BASE_URL}/test`, {
    headers: { "x-user-id": userId },
  });
  const remaining = res.headers.get("x-ratelimit-remaining") ?? "?";
  console.log(`[steady] ${userId} → ${res.status}  remaining: ${remaining}`);
}

async function virtualUser(userId) {
  while (true) {
    await hit(userId);
    await sleep(SLEEP_MS);
  }
}

const users = RETURNING_USERS.slice(0, VU_COUNT);
console.log(`Starting steady load — ${VU_COUNT} VUs, ${SLEEP_MS}ms between requests`);
await Promise.all(users.map((userId) => virtualUser(userId)));
