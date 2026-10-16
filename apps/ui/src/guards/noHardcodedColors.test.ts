/**
 * Architecture guard: no hardcoded color values in components.
 *
 * Components must use design tokens via CSS variables or Tailwind token classes.
 * Hardcoded hex, rgb, hsl values bypass the design system and cause drift.
 *
 * Allowed:   bg-primary, text-[var(--color-text-primary)], border-[var(--color-border)]
 * Forbidden: bg-[#FF6B35], text-[rgb(255,107,53)], style={{ color: "#1A1A1A" }}
 */

import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";
import { collectSourceFiles } from "./utils/collectSourceFiles";

const COMPONENTS_DIR = join(import.meta.dirname, "../components");

// Hardcoded colors in Tailwind arbitrary values: bg-[#fff], text-[rgb(...)], border-[hsl(...)]
const HARDCODED_TAILWIND = /(?:bg|text|border|ring|outline|shadow|fill|stroke|from|to|via)-\[(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/g;

// Hardcoded hex in inline styles: color: "#fff", backgroundColor: "#fff"
const HARDCODED_INLINE_HEX = /(?:color|background|border|fill|stroke)\s*[:=]\s*["']#[0-9a-fA-F]{3,8}["']/gi;

// Hardcoded rgb/hsl in inline styles
const HARDCODED_INLINE_FN = /(?:color|background|border|fill|stroke)\s*[:=]\s*["'](?:rgba?|hsla?)\(/gi;

describe("Architecture guard: no hardcoded colors", () => {
  const componentFiles = collectSourceFiles(COMPONENTS_DIR, ".tsx");

  it("found component files to check", () => {
    expect(componentFiles.length).toBeGreaterThan(0);
  });

  for (const componentPath of componentFiles) {
    const relativePath = componentPath.replace(COMPONENTS_DIR + "/", "");

    it(`${relativePath} — no hardcoded colors in Tailwind classes`, () => {
      const sourceContent = readFileSync(componentPath, "utf-8");
      const hardcodedMatches = sourceContent.match(HARDCODED_TAILWIND);
      expect(hardcodedMatches, `Found hardcoded colors: ${hardcodedMatches?.join(", ")}`).toBeNull();
    });

    it(`${relativePath} — no hardcoded hex in inline styles`, () => {
      const sourceContent = readFileSync(componentPath, "utf-8");
      const hardcodedMatches = sourceContent.match(HARDCODED_INLINE_HEX);
      expect(hardcodedMatches, `Found hardcoded hex: ${hardcodedMatches?.join(", ")}`).toBeNull();
    });

    it(`${relativePath} — no hardcoded rgb/hsl in inline styles`, () => {
      const sourceContent = readFileSync(componentPath, "utf-8");
      const hardcodedMatches = sourceContent.match(HARDCODED_INLINE_FN);
      expect(hardcodedMatches, `Found hardcoded color function: ${hardcodedMatches?.join(", ")}`).toBeNull();
    });
  }
});
