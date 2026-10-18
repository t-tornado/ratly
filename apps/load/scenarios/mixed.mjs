// Mixed scenario — varied steady traffic + burst users running concurrently
// Assumes: 100 req limit / 3600s window per user
// Steady VUs: user-001..user-150, varied pacing (exhaust at 2/4/6/10 min)
// Burst VUs:  user-181..user-200, 1 req/s — exhaust in ~100s

import { BASE_URL } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

const REQUEST_GAP_MS = 1_000;

const STEADY_PROFILES = [
  { count: 8, cycleSleepMs: 1_400, requestsPerCycle: 2, label: "heavy" },
  { count: 30, cycleSleepMs: 2_400, requestsPerCycle: 1, label: "moderate" },
  { count: 52, cycleSleepMs: 3_600, requestsPerCycle: 1, label: "steady" },
  { count: 60, cycleSleepMs: 6_000, requestsPerCycle: 1, label: "light" },
];

const BURST_USERS = RETURNING_USERS.slice(180, 200);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = (ms) => ms + ms * (Math.random() * 0.4 - 0.2);

async function hit(userId, label) {
  const res = await fetch(`${BASE_URL}/test`, {
    headers: { "x-user-id": userId },
  });
  const remaining = res.headers.get("x-count") ?? "?";
  console.log(`[${label}] ${userId} → ${res.status}  remaining: ${remaining}`);
}

async function steadyVU(userId, profile) {
  await sleep(Math.random() * 3_000);

  while (true) {
    for (let i = 0; i < profile.requestsPerCycle; i++) {
      await hit(userId, profile.label);
      if (i < profile.requestsPerCycle - 1) await sleep(REQUEST_GAP_MS);
    }
    await sleep(jitter(profile.cycleSleepMs));
  }
}

async function burstVU(userId) {
  while (true) {
    await hit(userId, "burst");
    await sleep(REQUEST_GAP_MS);
  }
}

const steadyVUs = [];
let offset = 0;
for (const profile of STEADY_PROFILES) {
  const users = RETURNING_USERS.slice(offset, offset + profile.count);
  for (const userId of users) {
    steadyVUs.push({ userId, profile });
  }
  offset += profile.count;
}

console.log(
  `Starting mixed load — ${steadyVUs.length} steady VUs (varied) + ${BURST_USERS.length} burst VUs:`
);
for (const profile of STEADY_PROFILES) {
  console.log(
    `  ${profile.label}: ${profile.count} users, ${profile.requestsPerCycle} req/cycle`
  );
}
console.log(`  burst: ${BURST_USERS.length} users, 1 req every ${REQUEST_GAP_MS / 1_000}s`);

await Promise.all([
  ...steadyVUs.map(({ userId, profile }) => steadyVU(userId, profile)),
  ...BURST_USERS.map((userId) => burstVU(userId)),
]);
