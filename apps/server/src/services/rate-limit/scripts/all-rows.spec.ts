import { describe, it, expect } from "vitest";
import { unpackAllRows } from "./all-rows.js";

const NOW = 1_700_000_000_000;

function buildFlat(...users: (string | number)[][]): (string | number)[] {
  return [NOW, ...users.flat()];
}

function user(
  userId: string,
  used: number,
  bonus: number,
  pausedCount: number,
  limit: number,
  windowTtl: number,
  pauseTtl: number,
  lastSeen: number,
  lastResetAt: number = 0,
): (string | number)[] {
  return [userId, used, bonus, pausedCount, limit, windowTtl, pauseTtl, lastSeen, lastResetAt];
}

describe("unpackAllRows", () => {
  it("returns empty array for empty input", () => {
    expect(unpackAllRows([])).toEqual([]);
  });

  it("returns empty array when flat contains only now", () => {
    expect(unpackAllRows([NOW])).toEqual([]);
  });

  it("unpacks a single user correctly", () => {
    const flat = buildFlat(user("u1", 5, 0, 0, 100, 3000, -2, NOW - 1000));
    const rows = unpackAllRows(flat);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      userId:       "u1",
      used:         5,
      bonus:        0,
      pausedCount:  0,
      limit:        100,
      allowedTotal: 100,
      remaining:    95,
      at:           NOW,
      lastRequestAt: NOW - 1000,
    });
  });

  it("sets resetAt when windowTtl > 0", () => {
    const flat = buildFlat(user("u1", 5, 0, 0, 100, 3000, -2, NOW - 1000));
    const [row] = unpackAllRows(flat);
    expect(row.resetAt).toBe(NOW + 3000 * 1000);
  });

  it("sets resetAt to null when windowTtl is -2 (no active window)", () => {
    const flat = buildFlat(user("u1", 0, 0, 0, 100, -2, -2, NOW - 1000));
    const [row] = unpackAllRows(flat);
    expect(row.resetAt).toBeNull();
  });

  it("sets paused and pausedUntil when pauseTtl > 0", () => {
    const flat = buildFlat(user("u1", 5, 0, 1, 100, -2, 600, NOW - 500));
    const [row] = unpackAllRows(flat);
    expect(row.paused).toBe(true);
    expect(row.pausedUntil).toBe(NOW + 600 * 1000);
  });

  it("sets paused false and pausedUntil null when pauseTtl is -2", () => {
    const flat = buildFlat(user("u1", 5, 0, 0, 100, -2, -2, NOW - 500));
    const [row] = unpackAllRows(flat);
    expect(row.paused).toBe(false);
    expect(row.pausedUntil).toBeNull();
  });

  it("computes status ok when ratio < 0.9", () => {
    const flat = buildFlat(user("u1", 50, 0, 0, 100, -2, -2, NOW));
    expect(unpackAllRows(flat)[0].status).toBe("ok");
  });

  it("computes status warning when ratio >= 0.9", () => {
    const flat = buildFlat(user("u1", 90, 0, 0, 100, -2, -2, NOW));
    expect(unpackAllRows(flat)[0].status).toBe("warning");
  });

  it("computes status exceeded when ratio >= 1", () => {
    const flat = buildFlat(user("u1", 100, 0, 0, 100, -2, -2, NOW));
    expect(unpackAllRows(flat)[0].status).toBe("exceeded");
  });

  it("includes bonus in allowedTotal", () => {
    const flat = buildFlat(user("u1", 5, 20, 0, 100, -2, -2, NOW));
    const [row] = unpackAllRows(flat);
    expect(row.allowedTotal).toBe(120);
    expect(row.remaining).toBe(115);
  });

  it("unpacks 3 users and preserves order", () => {
    const flat = buildFlat(
      user("u1", 5,  0, 0, 100, 3000, -2,  NOW - 1000),
      user("u2", 10, 2, 1, 100, 2000, -2,  NOW - 2000),
      user("u3", 0,  0, 0, 100, -2,   -2,  NOW - 3000),
    );
    const rows = unpackAllRows(flat);

    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.userId)).toEqual(["u1", "u2", "u3"]);
  });

  it("sets lastAdminResetAt when value > 0", () => {
    const resetTs = NOW - 60_000;
    const flat = buildFlat(user("u1", 5, 0, 0, 100, 3000, -2, NOW - 1000, resetTs));
    const [row] = unpackAllRows(flat);
    expect(row.lastAdminResetAt).toBe(resetTs);
  });

  it("sets lastAdminResetAt to null when value is 0", () => {
    const flat = buildFlat(user("u1", 5, 0, 0, 100, 3000, -2, NOW - 1000, 0));
    const [row] = unpackAllRows(flat);
    expect(row.lastAdminResetAt).toBeNull();
  });

  it("sets at = now on every row", () => {
    const flat = buildFlat(
      user("u1", 0, 0, 0, 100, -2, -2, NOW),
      user("u2", 0, 0, 0, 100, -2, -2, NOW),
    );
    unpackAllRows(flat).forEach((row) => expect(row.at).toBe(NOW));
  });
});
