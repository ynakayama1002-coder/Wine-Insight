import { describe, expect, it } from "vitest";
import { getRating } from "@/lib/notion/property-values";

describe("getRating", () => {
  it("parses star select into 1..5", () => {
    expect(
      getRating({ type: "select", select: { name: "★★★★" } }),
    ).toBe(4);
    expect(
      getRating({ type: "select", select: { name: "★" } }),
    ).toBe(1);
  });

  it("keeps numeric ratings", () => {
    expect(getRating({ type: "number", number: 4.5 })).toBe(4.5);
  });

  it("returns null for empty or non-rating values", () => {
    expect(getRating({ type: "select", select: null })).toBeNull();
    expect(
      getRating({ type: "select", select: { name: "ふくよか" } }),
    ).toBeNull();
  });
});
