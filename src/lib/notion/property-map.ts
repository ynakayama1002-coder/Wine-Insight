/**
 * Notion DB の実プロパティ名 → 論理フィールドの対応。
 * 先頭ほど優先。実DB突合済み（Wine Insight DB）。
 *
 * 注意: 実DBの「評価」は multi_select の感覚タグであり点数ではない。
 * 点数相当は「好み」（★〜★★★★★）を使う。
 */
export const PROPERTY_MAP = {
  title: ["ワイン名", "Name", "タイトル", "Wine"],
  tastedAt: ["テイスティング日", "試飲日", "Date", "Tasted", "飲んだ日"],
  producer: ["生産者", "Producer", "ワイナリー", "Winery"],
  region: ["地域", "産地", "Region", "アペラシオン", "Appellation"],
  country: ["国", "Country"],
  grape: ["品種", "Grape", "ブドウ品種", "Varietal"],
  vintage: ["Vintage", "ヴィンテージ", "年"],
  color: ["色", "Color", "タイプ", "Type"],
  rating: ["好み", "Rating", "スコア", "Score", "点数"],
  price: ["価格", "Price", "値段"],
  notes: [
    "テイスティングコメント",
    "テイスティングノート",
    "ノート",
    "Notes",
    "メモ",
    "Comment",
  ],
  occasion: ["場所", "シーン", "Occasion", "機会"],
} as const;

export type LogicalField = keyof typeof PROPERTY_MAP;

export function resolvePropertyName(
  availableNames: string[],
  field: LogicalField,
): string | null {
  const candidates = PROPERTY_MAP[field];
  for (const name of candidates) {
    if (availableNames.includes(name)) return name;
  }
  // 大文字小文字を無視したフォールバック
  const lower = new Map(availableNames.map((n) => [n.toLowerCase(), n]));
  for (const name of candidates) {
    const hit = lower.get(name.toLowerCase());
    if (hit) return hit;
  }
  return null;
}
