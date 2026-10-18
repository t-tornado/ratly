import type { ActivityRange, RefreshOption } from "../types/activity";

const VALID_RANGES: ActivityRange[] = ["hour", "day"];
const VALID_REFRESH_OPTIONS: RefreshOption[] = ["off", "30s", "1m", "5m"];

const DEFAULT_RANGE: ActivityRange = "hour";
const DEFAULT_REFRESH: RefreshOption = "off";

function isValidRange(value: string | null): value is ActivityRange {
  return value !== null && VALID_RANGES.includes(value as ActivityRange);
}

function isValidRefresh(value: string | null): value is RefreshOption {
  return value !== null && VALID_REFRESH_OPTIONS.includes(value as RefreshOption);
}

export { DEFAULT_RANGE, DEFAULT_REFRESH, isValidRange, isValidRefresh };
