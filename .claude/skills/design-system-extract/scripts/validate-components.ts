/**
 * validate-components.ts
 *
 * Validates the agent's component extraction output against components.schema.json.
 * Does NOT re-parse the source. Just checks the output shape is correct.
 *
 * Usage:
 *   npx tsx .claude/skills/design-system-extract/scripts/validate-components.ts <output.json>
 *
 * Exit 0 = pass, Exit 1 = fail
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import Ajv2020 from "ajv/dist/2020.js";

const outputPath = resolve(process.argv[2]);
if (!outputPath) {
  console.error("Usage: validate-components.ts <output.json>");
  process.exit(1);
}

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  "../schemas/components.schema.json",
);

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const outputRaw = JSON.parse(readFileSync(outputPath, "utf-8"));

// Find the extract_components step
const componentStep = Array.isArray(outputRaw)
  ? outputRaw.find((s: any) => s.step === "extract_components")
  : outputRaw.steps?.find((s: any) => s.step === "extract_components");

if (!componentStep) {
  console.error("FAIL: No 'extract_components' step found in output.json");
  process.exit(1);
}

const ajv = new Ajv2020({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(componentStep.results);

if (valid) {
  console.log("PASS: Component output matches schema.");
  process.exit(0);
} else {
  console.log("FAIL: Component output does not match schema.\n");
  for (const err of validate.errors || []) {
    console.log(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}
