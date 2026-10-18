import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const loadScript = (name: string) => readFileSync(resolve(SCRIPTS_DIR, name), "utf-8");

export const fixedWindowScript = loadScript("fixed-window.lua");
export const userRowScript = loadScript("user-row.lua");
export const allRowsScript = loadScript("all-rows.lua");
export { unpackAllRows } from "./all-rows.js";
export const dashboardStatsScript = loadScript("dashboard-stats.lua");
export const addExtraScript = loadScript("add-extra.lua");
