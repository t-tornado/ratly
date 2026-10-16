/**
 * validate-write.ts
 *
 * Validates the write_tokens step output against write-tokens.schema.json,
 * then verifies each claimed token actually exists in the CSS file on disk.
 *
 * Usage:
 *   npx tsx .claude/skills/design-tokens/scripts/validate-write.ts <output.json>
 *
 * Exit 0 = pass, Exit 1 = fail
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import Ajv2020 from "ajv/dist/2020.js";

const outputPath = resolve(process.argv[2]);
if (!outputPath) {
  console.error("Usage: validate-write.ts <output.json>");
  process.exit(1);
}

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  "../schemas/write-tokens.schema.json",
);

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const outputRaw = JSON.parse(readFileSync(outputPath, "utf-8"));

interface TokenEntry {
  variable: string;
  value: string;
  action: string;
}

interface FileEntry {
  file: string;
  path: string;
  action: string;
  tokensWritten: number;
  tokensSkipped: number;
  tokens: TokenEntry[];
}

interface WriteStep {
  step: string;
  files: FileEntry[];
  summary: { totalTokens: number; added: number; updated: number; unchanged: number };
}

const writeStep: WriteStep | undefined = Array.isArray(outputRaw)
  ? outputRaw.find((s: any) => s.step === "write_tokens")
  : outputRaw.steps?.find((s: any) => s.step === "write_tokens");

if (!writeStep) {
  console.error("FAIL: No 'write_tokens' step found in output.json");
  process.exit(1);
}

// Schema validation
const ajv = new Ajv2020({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(writeStep);

if (!valid) {
  console.log("FAIL: Write output does not match schema.\n");
  for (const err of validate.errors || []) {
    console.log(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}

// Verify files exist and tokens are present in CSS
const errors: string[] = [];

for (const file of writeStep.files) {
  if (!existsSync(file.path)) {
    errors.push(`${file.file}: file not found at ${file.path}`);
    continue;
  }

  const css = readFileSync(file.path, "utf-8");

  for (const token of file.tokens) {
    if (token.action === "unchanged") continue;

    // Check variable name exists in file
    if (!css.includes(token.variable)) {
      errors.push(`${file.file}: variable "${token.variable}" not found in file`);
    }
  }

  // Check tokensWritten count matches
  const activeTokens = file.tokens.filter((t) => t.action !== "unchanged").length;
  if (file.tokensWritten !== activeTokens) {
    errors.push(
      `${file.file}: tokensWritten=${file.tokensWritten} but ${activeTokens} tokens were added/updated`,
    );
  }
}

// Verify summary counts
const totalFromFiles = writeStep.files.reduce((sum, f) => sum + f.tokens.length, 0);
const addedCount = writeStep.files.reduce(
  (sum, f) => sum + f.tokens.filter((t) => t.action === "added").length, 0,
);
const updatedCount = writeStep.files.reduce(
  (sum, f) => sum + f.tokens.filter((t) => t.action === "updated").length, 0,
);
const unchangedCount = writeStep.files.reduce(
  (sum, f) => sum + f.tokens.filter((t) => t.action === "unchanged").length, 0,
);

if (writeStep.summary.totalTokens !== totalFromFiles) {
  errors.push(`Summary totalTokens=${writeStep.summary.totalTokens} but counted ${totalFromFiles}`);
}
if (writeStep.summary.added !== addedCount) {
  errors.push(`Summary added=${writeStep.summary.added} but counted ${addedCount}`);
}
if (writeStep.summary.updated !== updatedCount) {
  errors.push(`Summary updated=${writeStep.summary.updated} but counted ${updatedCount}`);
}
if (writeStep.summary.unchanged !== unchangedCount) {
  errors.push(`Summary unchanged=${writeStep.summary.unchanged} but counted ${unchangedCount}`);
}

// --- Report ---
console.log("=== WRITE VALIDATION ===\n");

for (const file of writeStep.files) {
  console.log(`  ${file.file} (${file.action}): ${file.tokensWritten} written, ${file.tokensSkipped} skipped`);
}

console.log(
  `\nTotal: ${writeStep.summary.totalTokens} | Added: ${writeStep.summary.added} | Updated: ${writeStep.summary.updated} | Unchanged: ${writeStep.summary.unchanged}`,
);

if (errors.length > 0) {
  console.log("\n--- ERRORS ---");
  for (const e of errors) console.log(`  ${e}`);
  console.log(`\nFAIL: ${errors.length} error(s).`);
  process.exit(1);
}

console.log("\nPASS: All tokens written and verified on disk.");
process.exit(0);
