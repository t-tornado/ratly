/**
 * validate-build.ts
 *
 * Validates a build step (atoms or components) against build.schema.json,
 * then verifies each component file exists on disk.
 *
 * Usage:
 *   npx tsx .claude/skills/design-components/scripts/validate-build.ts <output.json> <step_name>
 *   e.g.: validate-build.ts output.json build_atoms
 *         validate-build.ts output.json build_components
 *
 * Exit 0 = pass, Exit 1 = fail
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import Ajv2020 from "ajv/dist/2020.js";

const outputPath = resolve(process.argv[2]);
const stepName = process.argv[3];

if (!outputPath || !stepName) {
  console.error("Usage: validate-build.ts <output.json> <step_name>");
  process.exit(1);
}

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  "../schemas/build.schema.json",
);

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const outputRaw = JSON.parse(readFileSync(outputPath, "utf-8"));

interface BuildFile {
  file: string;
  action: string;
}

interface BuildComponent {
  name: string;
  action: string;
  path: string;
  files: BuildFile[];
  variants?: string[];
  usesTokens?: string[];
  dependsOn?: string[];
}

interface BuildStep {
  step: string;
  layer: string;
  summary: { total: number; created: number; updated: number; skipped: number };
  components: BuildComponent[];
}

const buildStep: BuildStep | undefined = Array.isArray(outputRaw)
  ? outputRaw.find((s: any) => s.step === stepName)
  : outputRaw.steps?.find((s: any) => s.step === stepName);

if (!buildStep) {
  console.error(`FAIL: No '${stepName}' step found in output.json`);
  process.exit(1);
}

// Schema validation
const ajv = new Ajv2020({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(buildStep);

if (!valid) {
  console.log(`FAIL: ${stepName} output does not match schema.\n`);
  for (const err of validate.errors || []) {
    console.log(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}

// Verify files exist on disk
const errors: string[] = [];

for (const comp of buildStep.components) {
  if (comp.action === "skipped") continue;

  for (const file of comp.files) {
    if (file.action === "unchanged") continue;

    const fullPath = resolve(comp.path, file.file);
    if (!existsSync(fullPath)) {
      errors.push(`${comp.name}: file "${file.file}" not found at ${fullPath}`);
    }
  }
}

// Verify summary counts
const created = buildStep.components.filter((c) => c.action === "created").length;
const updated = buildStep.components.filter((c) => c.action === "updated").length;
const skipped = buildStep.components.filter((c) => c.action === "skipped").length;

if (buildStep.summary.total !== buildStep.components.length) {
  errors.push(`Summary total=${buildStep.summary.total} but ${buildStep.components.length} components listed`);
}
if (buildStep.summary.created !== created) {
  errors.push(`Summary created=${buildStep.summary.created} but counted ${created}`);
}
if (buildStep.summary.updated !== updated) {
  errors.push(`Summary updated=${buildStep.summary.updated} but counted ${updated}`);
}
if (buildStep.summary.skipped !== skipped) {
  errors.push(`Summary skipped=${buildStep.summary.skipped} but counted ${skipped}`);
}

// --- Report ---
console.log(`=== ${stepName.toUpperCase()} VALIDATION ===\n`);

for (const comp of buildStep.components) {
  const fileCount = comp.files.filter((f) => f.action !== "unchanged").length;
  console.log(`  ${comp.action}: ${comp.name} (${fileCount} files)`);
}

console.log(
  `\nTotal: ${buildStep.summary.total} | Created: ${buildStep.summary.created} | Updated: ${buildStep.summary.updated} | Skipped: ${buildStep.summary.skipped}`,
);

if (errors.length > 0) {
  console.log("\n--- ERRORS ---");
  for (const e of errors) console.log(`  ${e}`);
  console.log(`\nFAIL: ${errors.length} error(s).`);
  process.exit(1);
}

console.log("\nPASS: All components built and verified on disk.");
process.exit(0);
