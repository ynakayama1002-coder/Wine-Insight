/**
 * Notion ページプロパティから値を取り出すヘルパー。
 * 未入力は null / [] を返し、推測補完しない。
 */

type NotionProp = Record<string, unknown> | null | undefined;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function plainTextFromRichText(richText: unknown): string | null {
  const parts = asArray<{ plain_text?: string }>(richText)
    .map((t) => t.plain_text ?? "")
    .join("")
    .trim();
  return parts.length > 0 ? parts : null;
}

export function getTitle(prop: NotionProp): string {
  if (!prop || prop.type !== "title") return "";
  return plainTextFromRichText(prop.title) ?? "";
}

export function getRichText(prop: NotionProp): string | null {
  if (!prop) return null;
  if (prop.type === "rich_text") return plainTextFromRichText(prop.rich_text);
  if (prop.type === "title") return plainTextFromRichText(prop.title);
  return null;
}

export function getSelect(prop: NotionProp): string | null {
  if (!prop) return null;
  if (prop.type === "select") {
    const name = (prop.select as { name?: string } | null)?.name?.trim();
    return name || null;
  }
  if (prop.type === "status") {
    const name = (prop.status as { name?: string } | null)?.name?.trim();
    return name || null;
  }
  return null;
}

export function getMultiSelect(prop: NotionProp): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return asArray<{ name?: string }>(prop.multi_select)
    .map((o) => o.name?.trim() ?? "")
    .filter(Boolean);
}

export function getNumber(prop: NotionProp): number | null {
  if (!prop) return null;
  if (prop.type === "number") {
    return typeof prop.number === "number" ? prop.number : null;
  }
  return null;
}

export function getDateStart(prop: NotionProp): string | null {
  if (!prop || prop.type !== "date") return null;
  const start = (prop.date as { start?: string } | null)?.start;
  if (!start) return null;
  // datetime の場合は日付部分のみ
  return start.slice(0, 10);
}

export function getCheckbox(prop: NotionProp): boolean | null {
  if (!prop || prop.type !== "checkbox") return null;
  return Boolean(prop.checkbox);
}

/** select / rich_text / title を文字列として取得 */
export function getStringish(prop: NotionProp): string | null {
  if (!prop) return null;
  const fromSelect = getSelect(prop);
  if (fromSelect) return fromSelect;
  const fromText = getRichText(prop);
  if (fromText) return fromText;
  if (prop.type === "number" && typeof prop.number === "number") {
    return String(prop.number);
  }
  return null;
}

/** multi_select 優先。なければ単一文字列を配列化 */
export function getGrapes(prop: NotionProp): string[] {
  if (!prop) return [];
  if (prop.type === "multi_select") return getMultiSelect(prop);
  const single = getStringish(prop);
  return single ? [single] : [];
}

export function getVintage(prop: NotionProp): number | string | null {
  if (!prop) return null;
  if (prop.type === "number") return getNumber(prop);
  const text = getStringish(prop);
  if (!text) return null;
  const asNum = Number(text);
  if (!Number.isNaN(asNum) && text.match(/^\d{4}$/)) return asNum;
  return text;
}
