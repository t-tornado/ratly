/**
 * validate-comparison.ts
 *
 * Validates the compare step output against comparison.schema.json.
 * Verifies screenshots exist on disk and summary counts match.
 *
 * Usage:
 *   npx tsx .claude/skills/visual-compare/scripts/validate-comparison.ts <output.json>
 *
 * Exit 0 = pass, Exit 1 = fail
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import Ajv from "ajv/dist/2020.js";

const outputPath = resolve(process.argv[2]);
if (!outputPath) {
  console.error("Usage: validate-comparison.ts <output.json>");
  process.exit(1);
}

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  "../schemas/comparison.schema.json",
);

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const outputRaw = JSON.parse(readFileSync(outputPath, "utf-8"));

interface Comparison {
  component: string;
  viewport: { name: string; width: number; height: number };
  status: string;
  diffPercentage: number;
  screenshotA: string;
  screenshotB: string;
  diffImage?: string;
}

interface CompareStep {
  step: string;
  summary: { total: number; match: number; close: number; mismatch: number };
  comparisons: Comparison[];
}

const compareStep: CompareStep | undefined = Array.isArray(outputRaw)
  ? outputRaw.find((s: any) => s.step === "compare")
  : outputRaw.steps?.find((s: any) => s.step === "compare");

if (!compareStep) {
  console.error("FAIL: No 'compare' step found in output.json");
  process.exit(1);
}

// Schema validation
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(compareStep);

if (!valid) {
  console.log("FAIL: Comparison output does not match schema.\n");
  for (const err of validate.errors || []) {
    console.log(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}

// Verify screenshots exist
const errors: string[] = [];

for (const comp of compareStep.comparisons) {
  if (!existsSync(comp.screenshotA)) {
    errors.push(`${comp.component}/${comp.viewport.name}: screenshotA not found at ${comp.screenshotA}`);
  }
  if (!existsSync(comp.screenshotB)) {
    errors.push(`${comp.component}/${comp.viewport.name}: screenshotB not found at ${comp.screenshotB}`);
  }
  if (comp.diffImage && !existsSync(comp.diffImage)) {
    errors.push(`${comp.component}/${comp.viewport.name}: diffImage not found at ${comp.diffImage}`);
  }
}

// Verify status thresholds
for (const comp of compareStep.comparisons) {
  if (comp.status === "error") continue;
  const expected =
    comp.diffPercentage < 2 ? "match" :
    comp.diffPercentage <= 10 ? "close" : "mismatch";
  if (comp.status !== expected) {
    errors.push(
      `${comp.component}/${comp.viewport.name}: diff ${comp.diffPercentage}% should be "${expected}" but marked "${comp.status}"`,
    );
  }
}

// Verify summary counts
const match = compareStep.comparisons.filter((c) => c.status === "match").length;
const close = compareStep.comparisons.filter((c) => c.status === "close").length;
const mismatch = compareStep.comparisons.filter((c) => c.status === "mismatch" || c.status === "error").length;

if (compareStep.summary.total !== compareStep.comparisons.length) {
  errors.push(`Summary total=${compareStep.summary.total} but ${compareStep.comparisons.length} comparisons listed`);
}
if (compareStep.summary.match !== match) {
  errors.push(`Summary match=${compareStep.summary.match} but counted ${match}`);
}
if (compareStep.summary.close !== close) {
  errors.push(`Summary close=${compareStep.summary.close} but counted ${close}`);
}
if (compareStep.summary.mismatch !== mismatch) {
  errors.push(`Summary mismatch=${compareStep.summary.mismatch} but counted ${mismatch}`);
}

// --- Report ---
console.log("=== COMPARISON VALIDATION ===\n");

for (const comp of compareStep.comparisons) {
  const icon = comp.status === "match" ? "MATCH" : comp.status === "close" ? "CLOSE" : "MISMATCH";
  console.log(`  ${icon}: ${comp.component} @ ${comp.viewport.name} — ${comp.diffPercentage}%`);
}

console.log(
  `\nTotal: ${compareStep.summary.total} | Match: ${compareStep.summary.match} | Close: ${compareStep.summary.close} | Mismatch: ${compareStep.summary.mismatch}`,
);

if (errors.length > 0) {
  console.log("\n--- ERRORS ---");
  for (const e of errors) console.log(`  ${e}`);
  console.log(`\nFAIL: ${errors.length} error(s).`);
  process.exit(1);
}

console.log("\nPASS: All comparisons valid.");
process.exit(0);
