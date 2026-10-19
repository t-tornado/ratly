/**
 * Architecture guard: no raw localStorage access outside safeLocalStorage wrapper.
 *
 * All localStorage access must go through safeLocalStorage for consistent
 * error handling and type safety. Direct calls bypass these guarantees.
 *
 * Allowed:   safeLocalStorage.get(...), safeLocalStorage.set(...)
 * Forbidden: localStorage.getItem(...), localStorage.setItem(...)
 */

import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";
import { collectSourceFiles } from "./utils/collectSourceFiles";

const UI_ROOT = join(import.meta.dirname, "..");

const EXCLUDED_DIRS = [
  join(UI_ROOT, "lib/safeLocalStorage"),
  join(UI_ROOT, "guards"),
  join(UI_ROOT, "modules/userDetail/utils/eventStream.ts"),
];

const RAW_LOCALSTORAGE = /localStorage\.(getItem|setItem|removeItem|clear)\s*\(/g;

function isExcluded(filePath: string): boolean {
  return EXCLUDED_DIRS.some((excludedDir) => filePath.startsWith(excludedDir));
}

describe("Architecture guard: no raw localStorage", () => {
  const sourceFiles = collectSourceFiles(UI_ROOT, ".ts")
    .concat(collectSourceFiles(UI_ROOT, ".tsx"))
    .filter((filePath) => !isExcluded(filePath));

  it("found source files to check", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  for (const filePath of sourceFiles) {
    const relativePath = filePath.replace(UI_ROOT + "/", "");

    it(`${relativePath} — no raw localStorage calls`, () => {
      const sourceContent = readFileSync(filePath, "utf-8");
      const rawMatches = sourceContent.match(RAW_LOCALSTORAGE);
      expect(
        rawMatches,
        `Found raw localStorage calls: ${rawMatches?.join(", ")}`,
      ).toBeNull();
    });
  }
});
