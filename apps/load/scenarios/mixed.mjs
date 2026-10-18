// Mixed scenario — realistic traffic: steady VUs + burst VUs running concurrently
// Assumes: 100 req limit / 3600s window per user
// Steady VUs: user-001..user-020, paced at 5s — stay under limit for ~8 min demo
// Burst VUs: user-046..user-050, no sleep — hit 429s immediately

import { BASE_URL } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

const STEADY_SLEEP_MS = 5_000;
const STEADY_USERS = RETURNING_USERS.slice(0, 20);
const BURST_USERS = RETURNING_USERS.slice(45, 50);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function hit(userId, tag) {
  const res = await fetch(`${BASE_URL}/test`, {
    headers: { "x-user-id": userId },
  });
  const remaining = res.headers.get("x-count") ?? "?";
  console.log(`[${tag}] ${userId} → ${res.status}  remaining: ${remaining}`);
}

async function steadyVU(userId) {
  while (true) {
    await hit(userId, "steady");
    await sleep(STEADY_SLEEP_MS);
  }
}

async function burstVU(userId) {
  while (true) {
    await hit(userId, "burst");
  }
}

console.log(
  `Starting mixed load — ${STEADY_USERS.length} steady VUs + ${BURST_USERS.length} burst VUs`
);

await Promise.all([
  ...STEADY_USERS.map((userId) => steadyVU(userId)),
  ...BURST_USERS.map((userId) => burstVU(userId)),
]);
