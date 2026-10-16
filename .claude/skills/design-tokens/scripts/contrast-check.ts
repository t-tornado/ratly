/**
 * contrast-check.ts
 *
 * Validates contrast ratios for all color token pairs in the mapping step output.
 * Also validates the contrast_check step output against contrast-check.schema.json.
 *
 * Usage:
 *   npx tsx .claude/skills/design-tokens/scripts/contrast-check.ts <output.json>
 *
 * Exit 0 = all pass, Exit 1 = failures found or invalid schema
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import Ajv2020 from "ajv/dist/2020.js";
import { contrastRatio } from "../../../apps/ui/src/guards/utils/contrastRatio.js";

const outputPath = resolve(process.argv[2]);
if (!outputPath) {
  console.error("Usage: contrast-check.ts <output.json>");
  process.exit(1);
}

// --- Load and validate ---

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  "../schemas/contrast-check.schema.json",
);

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const outputRaw = JSON.parse(readFileSync(outputPath, "utf-8"));

interface ContrastPair {
  foreground: string;
  background: string;
  foregroundValue: string;
  backgroundValue: string;
  ratio: number;
  required: number;
  level: string;
  status: string;
}

interface ContrastStep {
  step: string;
  summary: { total: number; passed: number; failed: number };
  pairs: ContrastPair[];
}

const contrastStep: ContrastStep | undefined = Array.isArray(outputRaw)
  ? outputRaw.find((s: any) => s.step === "contrast_check")
  : outputRaw.steps?.find((s: any) => s.step === "contrast_check");

if (!contrastStep) {
  console.error("FAIL: No 'contrast_check' step found in output.json");
  process.exit(1);
}

// Schema validation
const ajv = new Ajv2020({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(contrastStep);

if (!valid) {
  console.log("FAIL: Contrast check output does not match schema.\n");
  for (const err of validate.errors || []) {
    console.log(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}

// Verify the ratios are correct
const errors: string[] = [];
for (const pair of contrastStep.pairs) {
  const actual = contrastRatio(pair.foregroundValue, pair.backgroundValue);
  const rounded = Math.round(actual * 10) / 10;
  const claimed = Math.round(pair.ratio * 10) / 10;

  if (Math.abs(rounded - claimed) > 0.2) {
    errors.push(
      `${pair.foreground}/${pair.background}: claimed ${claimed}:1 but actual is ${rounded}:1`,
    );
  }

  const shouldPass = actual >= pair.required;
  if (shouldPass && pair.status === "fail") {
    errors.push(
      `${pair.foreground}/${pair.background}: ratio ${rounded}:1 meets ${pair.required}:1 but marked as fail`,
    );
  }
  if (!shouldPass && pair.status === "pass") {
    errors.push(
      `${pair.foreground}/${pair.background}: ratio ${rounded}:1 does NOT meet ${pair.required}:1 but marked as pass`,
    );
  }
}

// Verify summary counts
const actualPassed = contrastStep.pairs.filter((p) => p.status === "pass").length;
const actualFailed = contrastStep.pairs.filter((p) => p.status === "fail").length;

if (contrastStep.summary.passed !== actualPassed) {
  errors.push(
    `Summary says ${contrastStep.summary.passed} passed but counted ${actualPassed}`,
  );
}
if (contrastStep.summary.failed !== actualFailed) {
  errors.push(
    `Summary says ${contrastStep.summary.failed} failed but counted ${actualFailed}`,
  );
}
if (contrastStep.summary.total !== contrastStep.pairs.length) {
  errors.push(
    `Summary says ${contrastStep.summary.total} total but ${contrastStep.pairs.length} pairs listed`,
  );
}

// --- Report ---
console.log("=== CONTRAST CHECK VALIDATION ===\n");

for (const pair of contrastStep.pairs) {
  const icon = pair.status === "pass" ? "PASS" : "FAIL";
  console.log(
    `  ${icon}: ${pair.foreground} (${pair.foregroundValue}) on ${pair.background} (${pair.backgroundValue}) → ${pair.ratio}:1 (needs ${pair.required}:1 ${pair.level})`,
  );
}

console.log(
  `\nTotal: ${contrastStep.summary.total} | Passed: ${contrastStep.summary.passed} | Failed: ${contrastStep.summary.failed}`,
);

if (errors.length > 0) {
  console.log("\n--- VALIDATION ERRORS ---");
  for (const e of errors) console.log(`  ${e}`);
  console.log(`\nFAIL: ${errors.length} validation error(s).`);
  process.exit(1);
}

if (contrastStep.summary.failed > 0) {
  console.log("\nFAIL: Contrast failures found. User must confirm or fix.");
  process.exit(1);
}

console.log("\nPASS: All contrast ratios meet WCAG requirements.");
process.exit(0);
