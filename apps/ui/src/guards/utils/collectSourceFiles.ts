import { readdirSync, statSync } from "fs";
import { join } from "path";

const EXCLUDED_PATTERNS = [".stories.", ".test."];

function isSourceFile(filePath: string, extension: string): boolean {
  if (!filePath.endsWith(extension)) return false;
  return EXCLUDED_PATTERNS.every((pattern) => !filePath.includes(pattern));
}

export function collectSourceFiles(directory: string, extension: string): string[] {
  const sourceFiles: string[] = [];

  for (const entry of readdirSync(directory)) {
    const entryPath = join(directory, entry);

    if (statSync(entryPath).isDirectory()) {
      sourceFiles.push(...collectSourceFiles(entryPath, extension));
    } else if (isSourceFile(entryPath, extension)) {
      sourceFiles.push(entryPath);
    }
  }

  return sourceFiles;
}
