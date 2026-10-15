/**
 * validate-tokens.ts
 *
 * Validates the agent's token extraction output against tokens.schema.json.
 * Does NOT re-parse the source. Just checks the output shape is correct.
 *
 * Usage:
 *   npx tsx .claude/skills/design-system-extract/scripts/validate-tokens.ts <output.json>
 *
 * Exit 0 = pass, Exit 1 = fail
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import Ajv from "ajv";

const outputPath = resolve(process.argv[2]);
if (!outputPath) {
  console.error("Usage: validate-tokens.ts <output.json>");
  process.exit(1);
}

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  "../schemas/tokens.schema.json"
);

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const outputRaw = JSON.parse(readFileSync(outputPath, "utf-8"));

// Find the extract_tokens step
const tokenStep = Array.isArray(outputRaw)
  ? outputRaw.find((s: any) => s.step === "extract_tokens")
  : outputRaw.steps?.find((s: any) => s.step === "extract_tokens");

if (!tokenStep) {
  console.error("FAIL: No 'extract_tokens' step found in output.json");
  process.exit(1);
}

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(tokenStep.results);

if (valid) {
  console.log("PASS: Token output matches schema.");
  process.exit(0);
} else {
  console.log("FAIL: Token output does not match schema.\n");
  for (const err of validate.errors || []) {
    console.log(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}
