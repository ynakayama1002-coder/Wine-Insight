# 型定義と集計ロジック設計

## ドメイン型

```ts
type PeriodType = "weekly" | "monthly";

interface Period {
  type: PeriodType;
  start: string; // YYYY-MM-DD (inclusive)
  end: string;   // YYYY-MM-DD (inclusive)
}

interface TastingNote {
  id: string;
  title: string;
  tastedAt: string | null; // ISO date
  producer: string | null;
  region: string | null;
  country: string | null;
  grapes: string[];        // empty if unknown
  vintage: number | string | null;
  color: string | null;
  rating: number | null;
  price: number | null;
  notes: string | null;
  occasion: string | null;
  rawProperties: Record<string, unknown>; // デバッグ用
}
```

## 集計結果型

```ts
interface CountItem {
  key: string;
  count: number;
}

interface AggregationResult {
  period: Period;
  totalCount: number;
  ratedCount: number;
  averageRating: number | null; // ratedCount === 0 なら null
  byColor: CountItem[];
  byCountry: CountItem[];
  byRegion: CountItem[];
  byGrape: CountItem[];
  byProducer: CountItem[];
  ratingDistribution: CountItem[]; // "1".."5" など
  missingFieldRates: Record<string, number>; // 0..1
  insufficientSample: boolean; // 週<3 / 月<5
  sampleNotes: Array<Pick<TastingNote, "title" | "rating" | "notes" | "tastedAt">>;
}
```

## 集計ルール

1. **期間フィルタ**: `tastedAt` が period 内のもののみ。`tastedAt === null` は除外し、除外件数をログする
2. **カウント系**: 欠損はスキップ。キーは trim 後の文字列
3. **平均評価**: `rating != null` のみ。丸めは小数第1位
4. **品種**: multi_select は1本につき複数カウント（ワイン本数ではなく出現回数）
5. **ソート**: count 降順、同率はキー昇順
6. **insufficientSample**: `weekly && totalCount < 3` or `monthly && totalCount < 5`
7. **sampleNotes**: notes があるものから最大5件（評価高い順 → 日付新しい順）

## AI への渡し方（Phase 2）

- 渡すのは `AggregationResult` の JSON + sampleNotes のみ
- 生の全プロパティや API キーは渡さない
- システムプロンプトに「未入力を補完しない」「insufficientSample 時は断定しない」を固定

## テスト方針（キー不要）

| 対象 | 入力 | 期待 |
|---|---|---|
| mapper | fixture pages | 型どおりの TastingNote[] |
| filterByPeriod | notes + period | 境界日を含む |
| aggregate | notes | 平均・分布・insufficient フラグ |
| 欠損 | rating/notes なし | null / 率に反映、例外なし |
