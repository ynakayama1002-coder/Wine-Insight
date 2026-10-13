import { describe, expect, it } from "vitest";
import fixture from "@/lib/notion/__fixtures__/notion-pages.json";
import { mapNotionPages } from "@/lib/notion/map-page";
import type { NotionPageLike } from "@/lib/notion/map-page";

describe("mapNotionPageToTastingNote", () => {
  const notes = mapNotionPages(fixture as NotionPageLike[]);

  it("maps title, dates, and multi-select grapes", () => {
    const first = notes[0];
    expect(first.title).toBe("Château Demo 2018");
    expect(first.tastedAt).toBe("2026-10-06");
    expect(first.grapes).toEqual(["Cabernet Sauvignon", "Merlot"]);
    expect(first.rating).toBe(4.5);
    expect(first.notes).toContain("カシス");
  });

  it("normalizes datetime tastedAt to YYYY-MM-DD", () => {
    expect(notes[1].tastedAt).toBe("2026-10-08");
  });

  it("keeps nulls instead of inventing values", () => {
    const noDate = notes.find((n) => n.id === "page-3");
    expect(noDate?.tastedAt).toBeNull();

    const noRating = notes.find((n) => n.id === "page-5");
    expect(noRating?.rating).toBeNull();
    expect(noRating?.notes).toBeNull();
  });
});
