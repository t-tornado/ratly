/**
 * Steady scenario — varied-pace traffic across 400 users.
 *
 * Four traffic profiles spread users across different consumption rates.
 * Each virtual user loops indefinitely, hitting the rate-limit interceptor
 * until its window exhausts, then continues to generate 429s.
 *
 * Assumes: 100 req limit / 3600s window per user.
 *
 * @see RETURNING_USERS — fixed user pool shared across scenarios
 * @see BASE_URL — target server
 */

import { BASE_URL } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

/** Minimum pause between consecutive requests within a cycle. */
const REQUEST_GAP_MS = 1_000;

/**
 * Traffic profiles — each defines a consumption pace.
 *
 * Heavy:    2 reqs then 10s pause   → exhausts in ~8 min
 * Moderate: 1 req every 15s         → exhausts in ~25 min
 * Steady:   1 req every 30s         → exhausts in ~50 min
 * Light:    1 req every 60s         → exhausts in ~100 min
 */
const PROFILES = [
  { count: 20, cycleSleepMs: 10_000, requestsPerCycle: 2, label: "heavy" },
  { count: 80, cycleSleepMs: 15_000, requestsPerCycle: 1, label: "moderate" },
  { count: 140, cycleSleepMs: 30_000, requestsPerCycle: 1, label: "steady" },
  { count: 160, cycleSleepMs: 60_000, requestsPerCycle: 1, label: "light" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Adds ±20% randomness to prevent synchronized request waves. */
const jitter = (ms) => ms + ms * (Math.random() * 0.4 - 0.2);

async function hit(userId, label) {
  const res = await fetch(`${BASE_URL}/test`, {
    headers: { "x-user-id": userId },
  });
  const remaining = res.headers.get("x-count") ?? "?";
  console.log(`[${label}] ${userId} → ${res.status}  remaining: ${remaining}`);
}

/**
 * Simulates one user's traffic pattern.
 *
 * Staggers start by up to 15s to avoid a thundering herd at launch,
 * then loops through request cycles at the profile's pace.
 */
async function virtualUser(userId, profile) {
  await sleep(Math.random() * 15_000);

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

console.log("Waiting 15s before starting load...");
await sleep(15_000);

await Promise.all(vus.map(({ userId, profile }) => virtualUser(userId, profile)));
