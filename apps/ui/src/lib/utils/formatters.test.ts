import { describe, it, expect } from "vitest";
import { buildRowTags, mapUserRowToTableRow } from "./formatters";
import { mockUserRow, mockWarningRow, mockExceededRow, mockPausedRow, mockBonusRow, mockCustomLimitRow } from "../../test/fixtures";

describe("buildRowTags", () => {
  it("returns empty array for standard ok row", () => {
    expect(buildRowTags(mockUserRow)).toEqual([]);
  });

  it("adds bonus tag when bonus > 0", () => {
    const tags = buildRowTags(mockBonusRow);
    expect(tags).toContainEqual({ label: "+25 extra", variant: "tag-info" });
  });

  it("adds custom limit tag when limit !== DEFAULT_LIMIT", () => {
    const tags = buildRowTags(mockCustomLimitRow);
    expect(tags).toContainEqual({ label: "limit 200", variant: "tag-info" });
  });

  it("adds paused tag when paused", () => {
    const tags = buildRowTags(mockPausedRow);
    expect(tags).toContainEqual({ label: "paused", variant: "tag-warning" });
  });
});

describe("mapUserRowToTableRow", () => {
  it("maps status correctly for ok row", () => {
    const row = mapUserRowToTableRow(mockUserRow);
    expect(row.status).toBe("ok");
    expect(row.statusLabel).toBe("Ok");
  });

  it("maps status correctly for exceeded row", () => {
    const row = mapUserRowToTableRow(mockExceededRow);
    expect(row.status).toBe("exceeded");
    expect(row.remaining).toBe(0);
  });

  it("sets id from userId", () => {
    const row = mapUserRowToTableRow(mockUserRow);
    expect(row.id).toBe(mockUserRow.userId);
  });

  it("sets total from allowedTotal", () => {
    const row = mapUserRowToTableRow(mockBonusRow);
    expect(row.total).toBe(mockBonusRow.allowedTotal);
  });

  it("returns undefined tags for standard row", () => {
    const row = mapUserRowToTableRow(mockUserRow);
    expect(row.tags).toBeUndefined();
  });

  it("returns tags array for paused row", () => {
    const row = mapUserRowToTableRow(mockPausedRow);
    expect(row.tags).toBeDefined();
    expect(row.tags?.some((t) => t.label === "paused")).toBe(true);
  });

  it("maps warning status label correctly", () => {
    const row = mapUserRowToTableRow(mockWarningRow);
    expect(row.status).toBe("warning");
    expect(row.statusLabel).toBe("Warning");
  });
});
