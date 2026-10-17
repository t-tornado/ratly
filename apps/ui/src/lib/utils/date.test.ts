import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatTime, formatTimeWithSeconds, formatRelativeTime, formatCountdown } from "./date";

const NOW = 1_700_000_000_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatTime", () => {
  it("formats epoch to HH:MM", () => {
    const result = formatTime(NOW);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("formatTimeWithSeconds", () => {
  it("formats epoch to HH:MM:SS", () => {
    const result = formatTimeWithSeconds(NOW);
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe("formatRelativeTime", () => {
  it("returns seconds ago for recent timestamps", () => {
    expect(formatRelativeTime(NOW - 30_000)).toBe("30s ago");
  });

  it("returns minutes ago for timestamps in the past hour", () => {
    expect(formatRelativeTime(NOW - 3 * 60_000)).toBe("3m ago");
  });

  it("returns hours ago for timestamps within a day", () => {
    expect(formatRelativeTime(NOW - 2 * 3_600_000)).toBe("2h ago");
  });

  it("returns days ago for older timestamps", () => {
    expect(formatRelativeTime(NOW - 3 * 86_400_000)).toBe("3d ago");
  });
});

describe("formatCountdown", () => {
  it("returns em dash for null", () => {
    expect(formatCountdown(null)).toBe("—");
  });

  it("returns 'now' for elapsed time", () => {
    expect(formatCountdown(NOW - 1_000)).toBe("now");
  });

  it("returns seconds only for under a minute", () => {
    expect(formatCountdown(NOW + 45_000)).toBe("45s");
  });

  it("returns minutes and seconds for longer durations", () => {
    expect(formatCountdown(NOW + 125_000)).toBe("2m 05s");
  });
});
