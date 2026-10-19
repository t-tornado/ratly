/**
 * Mixed scenario — steady traffic + burst users running concurrently.
 *
 * Combines varied-pace steady users (150 total) with 20 aggressive burst
 * users firing at 1 req/s. Tests how the system behaves when calm and
 * heavy traffic coexist.
 *
 * Assumes: 100 req limit / 3600s window per user.
 *
 * @see RETURNING_USERS — fixed user pool, steady uses 0..149, burst uses 180..199
 * @see BASE_URL — target server
 */

import { BASE_URL } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

/** Minimum pause between consecutive requests within a cycle. */
const REQUEST_GAP_MS = 1_000;

/**
 * Steady traffic profiles — same shape as the steady scenario but smaller scale.
 *
 * Totals 150 users across four pacing tiers.
 */
const STEADY_PROFILES = [
  { count: 8, cycleSleepMs: 1_400, requestsPerCycle: 2, label: "heavy" },
  { count: 30, cycleSleepMs: 2_400, requestsPerCycle: 1, label: "moderate" },
  { count: 52, cycleSleepMs: 3_600, requestsPerCycle: 1, label: "steady" },
  { count: 60, cycleSleepMs: 6_000, requestsPerCycle: 1, label: "light" },
];

/** Burst users drawn from the tail of the pool to avoid overlap with steady. */
const BURST_USERS = RETURNING_USERS.slice(180, 200);

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
 * Simulates one steady user — staggers start, then loops at profile pace.
 *
 * @see virtualUser in steady.mjs — same pattern, shared logic
 */
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

/** Fires 1 req/s indefinitely — designed to exhaust limits quickly. */
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
