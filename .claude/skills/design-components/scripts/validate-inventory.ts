/**
 * validate-inventory.ts
 *
 * Validates the inventory step output against inventory.schema.json,
 * then verifies existing components are actually on disk.
 *
 * Usage:
 *   npx tsx .claude/skills/design-components/scripts/validate-inventory.ts <output.json>
 *
 * Exit 0 = pass, Exit 1 = fail
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import Ajv2020 from "ajv/dist/2020.js";

const outputPath = resolve(process.argv[2]);
if (!outputPath) {
  console.error("Usage: validate-inventory.ts <output.json>");
  process.exit(1);
}

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  "../schemas/inventory.schema.json",
);

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const outputRaw = JSON.parse(readFileSync(outputPath, "utf-8"));

interface InventoryEntry {
  name: string;
  status: string;
  action: string;
  path?: string;
  dependsOn?: string[];
}

interface InventoryStep {
  step: string;
  summary: { totalNeeded: number; existing: number; toCreate: number; toUpdate: number };
  atoms: InventoryEntry[];
  components: InventoryEntry[];
}

const inventoryStep: InventoryStep | undefined = Array.isArray(outputRaw)
  ? outputRaw.find((s: any) => s.step === "inventory")
  : outputRaw.steps?.find((s: any) => s.step === "inventory");

if (!inventoryStep) {
  console.error("FAIL: No 'inventory' step found in output.json");
  process.exit(1);
}

// Schema validation
const ajv = new Ajv2020({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(inventoryStep);

if (!valid) {
  console.log("FAIL: Inventory output does not match schema.\n");
  for (const err of validate.errors || []) {
    console.log(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}

// Verify existing components are on disk
const errors: string[] = [];
const allEntries = [...inventoryStep.atoms, ...inventoryStep.components];

for (const entry of allEntries) {
  if (entry.status === "exists" && entry.path) {
    if (!existsSync(entry.path)) {
      errors.push(`${entry.name}: marked "exists" but not found at ${entry.path}`);
    }
  }
}

// Verify summary counts
const totalNeeded = allEntries.length;
const existing = allEntries.filter((e) => e.status === "exists").length;
const toCreate = allEntries.filter((e) => e.action === "create").length;
const toUpdate = allEntries.filter((e) => e.action === "update").length;

if (inventoryStep.summary.totalNeeded !== totalNeeded) {
  errors.push(`Summary totalNeeded=${inventoryStep.summary.totalNeeded} but counted ${totalNeeded}`);
}
if (inventoryStep.summary.existing !== existing) {
  errors.push(`Summary existing=${inventoryStep.summary.existing} but counted ${existing}`);
}
if (inventoryStep.summary.toCreate !== toCreate) {
  errors.push(`Summary toCreate=${inventoryStep.summary.toCreate} but counted ${toCreate}`);
}
if (inventoryStep.summary.toUpdate !== toUpdate) {
  errors.push(`Summary toUpdate=${inventoryStep.summary.toUpdate} but counted ${toUpdate}`);
}

// Verify dependencies reference known components
const allNames = new Set(allEntries.map((e) => e.name));
for (const entry of allEntries) {
  for (const dep of entry.dependsOn || []) {
    if (!allNames.has(dep)) {
      errors.push(`${entry.name}: depends on "${dep}" which is not in the inventory`);
    }
  }
}

// --- Report ---
console.log("=== INVENTORY VALIDATION ===\n");
console.log(`  Atoms: ${inventoryStep.atoms.length}`);
console.log(`  Components: ${inventoryStep.components.length}`);
console.log(`  To create: ${toCreate}`);
console.log(`  To update: ${toUpdate}`);
console.log(`  Existing: ${existing}`);

if (errors.length > 0) {
  console.log("\n--- ERRORS ---");
  for (const e of errors) console.log(`  ${e}`);
  console.log(`\nFAIL: ${errors.length} error(s).`);
  process.exit(1);
}

console.log("\nPASS: Inventory valid. All references intact.");
process.exit(0);
