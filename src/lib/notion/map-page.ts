import type { TastingNote } from "@/lib/types";
import {
  type LogicalField,
  resolvePropertyName,
} from "@/lib/notion/property-map";
import {
  getDateStart,
  getGrapes,
  getNumber,
  getSelect,
  getStringish,
  getTitle,
  getVintage,
} from "@/lib/notion/property-values";

/** Notion SDK の PageObjectResponse 相当（テスト用に緩い型） */
export interface NotionPageLike {
  id: string;
  properties: Record<string, Record<string, unknown>>;
}

function prop(
  properties: NotionPageLike["properties"],
  names: string[],
  field: LogicalField,
): Record<string, unknown> | null {
  const key = resolvePropertyName(names, field);
  if (!key) return null;
  return properties[key] ?? null;
}

export function mapNotionPageToTastingNote(page: NotionPageLike): TastingNote {
  const properties = page.properties ?? {};
  const names = Object.keys(properties);

  const titleProp = prop(properties, names, "title");
  const title =
    (titleProp ? getTitle(titleProp) : null) ||
    getStringish(titleProp) ||
    "(無題)";

  return {
    id: page.id,
    title,
    tastedAt: getDateStart(prop(properties, names, "tastedAt")),
    producer: getStringish(prop(properties, names, "producer")),
    region: getStringish(prop(properties, names, "region")),
    country: getStringish(prop(properties, names, "country")),
    grapes: getGrapes(prop(properties, names, "grape")),
    vintage: getVintage(prop(properties, names, "vintage")),
    color: getSelect(prop(properties, names, "color")) ??
      getStringish(prop(properties, names, "color")),
    rating: getNumber(prop(properties, names, "rating")),
    price: getNumber(prop(properties, names, "price")),
    notes: getStringish(prop(properties, names, "notes")),
    occasion: getStringish(prop(properties, names, "occasion")),
    rawPropertyNames: names,
  };
}

export function mapNotionPages(pages: NotionPageLike[]): TastingNote[] {
  return pages.map(mapNotionPageToTastingNote);
}
