import { describe, it, expect } from "vitest";
import { toRateUpdateEvent, toLimitExceededEvent } from "./eventTransformers";
import { mockUserRow, mockExceededRow } from "../../../test/fixtures";

describe("toRateUpdateEvent", () => {
  it("returns info severity", () => {
    expect(toRateUpdateEvent(mockUserRow).severity).toBe("info");
  });

  it("type is rate:update", () => {
    expect(toRateUpdateEvent(mockUserRow).type).toBe("rate:update");
  });

  it("description contains userId and remaining", () => {
    const event = toRateUpdateEvent(mockUserRow);
    expect(event.description).toContain(mockUserRow.userId);
    expect(event.description).toContain(String(mockUserRow.remaining));
  });
});

describe("toLimitExceededEvent", () => {
  it("returns error severity", () => {
    expect(toLimitExceededEvent(mockExceededRow).severity).toBe("error");
  });

  it("type is rate:limit_exceeded", () => {
    expect(toLimitExceededEvent(mockExceededRow).type).toBe("rate:limit_exceeded");
  });

  it("description contains userId", () => {
    const event = toLimitExceededEvent(mockExceededRow);
    expect(event.description).toContain(mockExceededRow.userId);
  });

  it("description contains reset time when resetAt is set", () => {
    const event = toLimitExceededEvent(mockExceededRow);
    expect(event.description).toContain("retry");
  });
});
