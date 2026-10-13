import { describe, expect, it } from "vitest";
import fixture from "@/lib/notion/__fixtures__/notion-pages.json";
import { mapNotionPages } from "@/lib/notion/map-page";
import type { NotionPageLike } from "@/lib/notion/map-page";
import { aggregateNotes, filterNotesByPeriod } from "@/lib/aggregate";
import type { Period } from "@/lib/types";

const notes = mapNotionPages(fixture as NotionPageLike[]);

const week: Period = {
  type: "weekly",
  start: "2026-10-06",
  end: "2026-10-12",
};

describe("filterNotesByPeriod", () => {
  it("includes boundary dates and excludes null / outside", () => {
    const { included, excludedWithoutDate } = filterNotesByPeriod(notes, week);
    expect(included.map((n) => n.id).sort()).toEqual([
      "page-1",
      "page-2",
      "page-5",
    ]);
    expect(excludedWithoutDate).toBe(1);
  });
});

describe("aggregateNotes", () => {
  it("computes counts and average without guessing missing ratings", () => {
    const result = aggregateNotes(notes, week);
    expect(result.totalCount).toBe(3);
    expect(result.ratedCount).toBe(2);
    expect(result.averageRating).toBe(4.3); // (4.5 + 4) / 2
    expect(result.byCountry).toEqual([
      { key: "France", count: 2 },
      { key: "Germany", count: 1 },
    ]);
    expect(result.byGrape.map((g) => g.key)).toContain("Merlot");
    expect(result.insufficientSample).toBe(false); // 3 >= weekly threshold
  });

  it("marks insufficient sample for sparse months", () => {
    const month: Period = {
      type: "monthly",
      start: "2026-10-01",
      end: "2026-10-31",
    };
    const result = aggregateNotes(notes, month);
    expect(result.totalCount).toBe(3);
    expect(result.insufficientSample).toBe(true); // 3 < 5
  });

  it("exposes missing field rates", () => {
    const result = aggregateNotes(notes, week);
    expect(result.missingFieldRates.rating).toBe(0.3); // 1/3
    expect(result.missingFieldRates.notes).toBe(0.3);
  });
});
