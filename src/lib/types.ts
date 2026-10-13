/** ドメイン型 — Notion / Claude / Supabase から独立 */

export type PeriodType = "weekly" | "monthly";

export interface Period {
  type: PeriodType;
  /** YYYY-MM-DD inclusive */
  start: string;
  /** YYYY-MM-DD inclusive */
  end: string;
}

export interface TastingNote {
  id: string;
  title: string;
  tastedAt: string | null;
  producer: string | null;
  region: string | null;
  country: string | null;
  grapes: string[];
  vintage: number | string | null;
  color: string | null;
  rating: number | null;
  price: number | null;
  notes: string | null;
  occasion: string | null;
  /** デバッグ・スキーマ突合用。集計では使わない */
  rawPropertyNames: string[];
}

export interface CountItem {
  key: string;
  count: number;
}

export interface AggregationResult {
  period: Period;
  totalCount: number;
  excludedWithoutDate: number;
  ratedCount: number;
  averageRating: number | null;
  byColor: CountItem[];
  byCountry: CountItem[];
  byRegion: CountItem[];
  byGrape: CountItem[];
  byProducer: CountItem[];
  ratingDistribution: CountItem[];
  missingFieldRates: Record<string, number>;
  insufficientSample: boolean;
  sampleNotes: Array<
    Pick<TastingNote, "id" | "title" | "rating" | "notes" | "tastedAt">
  >;
}

export const SAMPLE_THRESHOLDS = {
  weekly: 3,
  monthly: 5,
} as const;
