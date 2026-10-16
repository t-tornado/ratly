/**
 * Architecture guard: color token contrast ratios meet WCAG AA.
 *
 * Parses color tokens from CSS files and checks every text/status color
 * against every background surface. Fails if any pair drops below 4.5:1
 * (AA normal text) or 3:1 (AA large text for status indicators).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";
import { contrastRatio } from "./utils/contrastRatio";

const STYLES_DIR = join(import.meta.dirname, "../styles");

const WCAG_AA_NORMAL = 4.5;

interface TokenPair {
  foreground: string;
  foregroundValue: string;
  background: string;
  backgroundValue: string;
  threshold: number;
  thresholdLabel: string;
}

function parseTokens(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const tokens: Record<string, string> = {};
  const variablePattern = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = variablePattern.exec(content)) !== null) {
    const value = match[2].trim();
    // Skip non-color tokens (spacing, font, radius, shadow, animation, leading, tracking)
    if (
      match[1].startsWith("--spacing") ||
      match[1].startsWith("--font") ||
      match[1].startsWith("--radius") ||
      match[1].startsWith("--shadow") ||
      match[1].startsWith("--animate") ||
      match[1].startsWith("--leading") ||
      match[1].startsWith("--tracking") ||
      match[1].startsWith("--text-")
    ) {
      continue;
    }
    // Only keep values that look like colors (hex, rgb, hsl)
    if (/^#[0-9a-fA-F]|^rgba?\(|^hsla?\(/.test(value)) {
      tokens[match[1]] = value;
    }
  }

  return tokens;
}

function buildPairs(
  lightTokens: Record<string, string>,
  darkTokens: Record<string, string>,
  themeIndependentTokens: Record<string, string>,
): { light: TokenPair[]; dark: TokenPair[] } {
  const textSuffixes = ["-text", "-text-primary", "-text-secondary", "-text-tertiary", "-text-muted"];
  const bgSuffixes = ["-bg-base", "-bg-surface", "-bg-surface-raised"];
  const statusTextSuffixes = ["-success-text", "-warning-text", "-error-text"];

  function collectPairs(
    colorTokens: Record<string, string>,
  ): TokenPair[] {
    const allTokens = { ...themeIndependentTokens, ...colorTokens };
    const pairs: TokenPair[] = [];

    const foregroundNames = Object.keys(allTokens).filter((name) =>
      textSuffixes.some((suffix) => name.endsWith(suffix)),
    );
    const statusForegroundNames = Object.keys(allTokens).filter((name) =>
      statusTextSuffixes.some((suffix) => name.endsWith(suffix)),
    );
    const backgroundNames = Object.keys(allTokens).filter((name) =>
      bgSuffixes.some((suffix) => name.endsWith(suffix)),
    );

    // Text colors against backgrounds — AA normal (4.5:1)
    for (const fg of foregroundNames) {
      for (const bg of backgroundNames) {
        pairs.push({
          foreground: fg,
          foregroundValue: allTokens[fg],
          background: bg,
          backgroundValue: allTokens[bg],
          threshold: WCAG_AA_NORMAL,
          thresholdLabel: "AA normal (4.5:1)",
        });
      }
    }

    // Status text colors against backgrounds — AA large (3:1)
    // Status text is typically used at small sizes, but status indicators
    // with icons get AA large. We check both thresholds separately.
    for (const fg of statusForegroundNames) {
      // Skip if already covered by text check above
      if (foregroundNames.includes(fg)) continue;
      for (const bg of backgroundNames) {
        pairs.push({
          foreground: fg,
          foregroundValue: allTokens[fg],
          background: bg,
          backgroundValue: allTokens[bg],
          threshold: WCAG_AA_NORMAL,
          thresholdLabel: "AA normal (4.5:1)",
        });
      }
    }

    return pairs;
  }

  return {
    light: collectPairs(lightTokens),
    dark: collectPairs(darkTokens),
  };
}

const lightTokens = parseTokens(join(STYLES_DIR, "colors.light.css"));
const darkTokens = parseTokens(join(STYLES_DIR, "colors.dark.css"));
const themeIndependentTokens = parseTokens(join(STYLES_DIR, "tokens.css"));

const { light: lightPairs, dark: darkPairs } = buildPairs(
  lightTokens,
  darkTokens,
  themeIndependentTokens,
);

describe("Architecture guard: color token contrast (light mode)", () => {
  it("found token pairs to check", () => {
    expect(lightPairs.length).toBeGreaterThan(0);
  });

  for (const pair of lightPairs) {
    it(`${pair.foreground} on ${pair.background} meets ${pair.thresholdLabel}`, () => {
      const ratio = contrastRatio(pair.foregroundValue, pair.backgroundValue);
      const rounded = Math.round(ratio * 100) / 100;
      expect(
        rounded,
        `${pair.foreground} (${pair.foregroundValue}) on ${pair.background} (${pair.backgroundValue}): ${rounded}:1, needs ${pair.threshold}:1`,
      ).toBeGreaterThanOrEqual(pair.threshold);
    });
  }
});

describe("Architecture guard: color token contrast (dark mode)", () => {
  it("found token pairs to check", () => {
    expect(darkPairs.length).toBeGreaterThan(0);
  });

  for (const pair of darkPairs) {
    it(`${pair.foreground} on ${pair.background} meets ${pair.thresholdLabel}`, () => {
      const ratio = contrastRatio(pair.foregroundValue, pair.backgroundValue);
      const rounded = Math.round(ratio * 100) / 100;
      expect(
        rounded,
        `${pair.foreground} (${pair.foregroundValue}) on ${pair.background} (${pair.backgroundValue}): ${rounded}:1, needs ${pair.threshold}:1`,
      ).toBeGreaterThanOrEqual(pair.threshold);
    });
  }
});
