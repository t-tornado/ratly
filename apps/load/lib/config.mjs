/** Target server URL — overridden via LOAD_TARGET in Docker. */
export const BASE_URL = process.env.LOAD_TARGET ?? "http://localhost:3000";

const DEFAULT_VUS = 300;

/**
 * Parses --vus from CLI args. Falls back to DEFAULT_VUS.
 *
 * Usage: `node scenarios/steady.mjs --vus 100`
 */
export function parseVUs() {
  const idx = process.argv.indexOf("--vus");
  if (idx !== -1 && process.argv[idx + 1]) {
    const parsed = Number(process.argv[idx + 1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_VUS;
}
