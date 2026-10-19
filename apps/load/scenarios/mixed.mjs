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

import { BASE_URL, parseVUs } from "../lib/config.mjs";
import { RETURNING_USERS } from "../lib/users.mjs";

const TOTAL_VUS = parseVUs();

/** Minimum pause between consecutive requests within a cycle. */
const REQUEST_GAP_MS = 1_000;

/** ~88% of VUs go to steady, ~12% to burst (original ratio: 150/170). */
const STEADY_VUS = Math.round(TOTAL_VUS * 0.88);
const BURST_VU_COUNT = TOTAL_VUS - STEADY_VUS;

/**
 * Steady traffic profiles — weights scaled from STEADY_VUS.
 *
 * Weights preserve original ratio: 8:30:52:60.
 */
const STEADY_WEIGHTS = [
  { weight: 8, cycleSleepMs: 1_400, requestsPerCycle: 2, label: "heavy" },
  { weight: 30, cycleSleepMs: 2_400, requestsPerCycle: 1, label: "moderate" },
  { weight: 52, cycleSleepMs: 3_600, requestsPerCycle: 1, label: "steady" },
  { weight: 60, cycleSleepMs: 6_000, requestsPerCycle: 1, label: "light" },
];

const STEADY_WEIGHT_SUM = STEADY_WEIGHTS.reduce((sum, p) => sum + p.weight, 0);
const STEADY_PROFILES = STEADY_WEIGHTS.map((p) => ({
  ...p,
  count: Math.max(1, Math.round((p.weight / STEADY_WEIGHT_SUM) * STEADY_VUS)),
}));

/** Burst users drawn from the tail of the pool to avoid overlap with steady. */
const BURST_USERS = RETURNING_USERS.slice(180, 180 + BURST_VU_COUNT);

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
