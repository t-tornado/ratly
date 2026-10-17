import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));

const consumeFixedWindowScript = readFileSync(
  resolve(SCRIPTS_DIR, "consume-fixed-window.lua"),
  "utf-8",
);

export { consumeFixedWindowScript };
