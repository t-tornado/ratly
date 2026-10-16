/**
 * validate-provision.ts
 *
 * Validates the provision step output against provision.schema.json.
 *
 * Usage:
 *   npx tsx .claude/skills/design-tokens/scripts/validate-provision.ts <output.json>
 *
 * Exit 0 = pass, Exit 1 = fail
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import Ajv2020 from "ajv/dist/2020.js";

const outputPath = resolve(process.argv[2]);
if (!outputPath) {
  console.error("Usage: validate-provision.ts <output.json>");
  process.exit(1);
}

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  "../schemas/provision.schema.json",
);

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const outputRaw = JSON.parse(readFileSync(outputPath, "utf-8"));

// Find the provision step
interface ProvisionStep {
  step: string;
  files: Record<string, { status: string; path: string }>;
}

const provisionStep: ProvisionStep | undefined = Array.isArray(outputRaw)
  ? outputRaw.find((s: any) => s.step === "provision")
  : outputRaw.steps?.find((s: any) => s.step === "provision");

if (!provisionStep) {
  console.error("FAIL: No 'provision' step found in output.json");
  process.exit(1);
}

// Schema validation
const ajv = new Ajv2020({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(provisionStep);

if (!valid) {
  console.log("FAIL: Provision output does not match schema.\n");
  for (const err of validate.errors || []) {
    console.log(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}

// Verify files actually exist on disk
const errors: string[] = [];
for (const [name, info] of Object.entries(provisionStep.files)) {
  if (!existsSync(info.path)) {
    errors.push(`${name}: claimed "${info.status}" but file not found at ${info.path}`);
  }
}

if (errors.length > 0) {
  console.log("FAIL: Files claimed but not on disk.\n");
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}

console.log("PASS: Provision output matches schema. All files exist.");
process.exit(0);
