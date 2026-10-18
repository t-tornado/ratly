// Steady scenario — varied-pace traffic across 200 users
// Assumes: 100 req limit / 3600s window per user
// Users move at different speeds — exhaust at 2, 4, 6, or 10 min
// 1s minimum gap between requests to avoid overwhelming the server

import { BASE_URL } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

const REQUEST_GAP_MS = 1_000;

// Heavy:    2 reqs then 1.4s pause → exhausts in ~2 min
// Moderate: 1 req every 2.4s       → exhausts in ~4 min
// Steady:   1 req every 3.6s       → exhausts in ~6 min
// Light:    1 req every 6s         → exhausts in ~10 min
const PROFILES = [
  { count: 10, cycleSleepMs: 1_400, requestsPerCycle: 2, label: "heavy" },
  { count: 40, cycleSleepMs: 2_400, requestsPerCycle: 1, label: "moderate" },
  { count: 70, cycleSleepMs: 3_600, requestsPerCycle: 1, label: "steady" },
  { count: 80, cycleSleepMs: 6_000, requestsPerCycle: 1, label: "light" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = (ms) => ms + ms * (Math.random() * 0.4 - 0.2);

async function hit(userId, label) {
  const res = await fetch(`${BASE_URL}/test`, {
    headers: { "x-user-id": userId },
  });
  const remaining = res.headers.get("x-count") ?? "?";
  console.log(`[${label}] ${userId} → ${res.status}  remaining: ${remaining}`);
}

async function virtualUser(userId, profile) {
  await sleep(Math.random() * 3_000);

  while (true) {
    for (let i = 0; i < profile.requestsPerCycle; i++) {
      await hit(userId, profile.label);
      if (i < profile.requestsPerCycle - 1) await sleep(REQUEST_GAP_MS);
    }
    await sleep(jitter(profile.cycleSleepMs));
  }
}

const vus = [];
let offset = 0;
for (const profile of PROFILES) {
  const users = RETURNING_USERS.slice(offset, offset + profile.count);
  for (const userId of users) {
    vus.push({ userId, profile });
  }
  offset += profile.count;
}

console.log(`Starting steady load — ${vus.length} VUs, varied pacing:`);
for (const profile of PROFILES) {
  const cycleTotalSec = (profile.requestsPerCycle - 1 + profile.cycleSleepMs / 1_000).toFixed(1);
  const exhaustMin = ((100 / profile.requestsPerCycle) * cycleTotalSec / 60).toFixed(0);
  console.log(
    `  ${profile.label}: ${profile.count} users, ${profile.requestsPerCycle} req/cycle, ~${exhaustMin} min to exhaust`
  );
}

await Promise.all(vus.map(({ userId, profile }) => virtualUser(userId, profile)));
