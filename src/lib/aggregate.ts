import {
  type AggregationResult,
  type CountItem,
  type Period,
  SAMPLE_THRESHOLDS,
  type TastingNote,
} from "@/lib/types";

function inPeriod(date: string, period: Period): boolean {
  return date >= period.start && date <= period.end;
}

export function filterNotesByPeriod(
  notes: TastingNote[],
  period: Period,
): { included: TastingNote[]; excludedWithoutDate: number } {
  const included: TastingNote[] = [];
  let excludedWithoutDate = 0;

  for (const note of notes) {
    if (!note.tastedAt) {
      excludedWithoutDate += 1;
      continue;
    }
    if (inPeriod(note.tastedAt, period)) {
      included.push(note);
    }
  }

  return { included, excludedWithoutDate };
}

function countBy(
  values: Array<string | null | undefined>,
): CountItem[] {
  const map = new Map<string, number>();
  for (const raw of values) {
    if (raw == null) continue;
    const key = raw.trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function missingRate(notes: TastingNote[], field: keyof TastingNote): number {
  if (notes.length === 0) return 0;
  let missing = 0;
  for (const note of notes) {
    const value = note[field];
    if (value == null) missing += 1;
    else if (Array.isArray(value) && value.length === 0) missing += 1;
    else if (typeof value === "string" && value.trim() === "") missing += 1;
  }
  return round1(missing / notes.length);
}

function pickSampleNotes(notes: TastingNote[], limit = 5) {
  return [...notes]
    .filter((n) => n.notes && n.notes.trim().length > 0)
    .sort((a, b) => {
      const ra = a.rating ?? -1;
      const rb = b.rating ?? -1;
      if (rb !== ra) return rb - ra;
      return (b.tastedAt ?? "").localeCompare(a.tastedAt ?? "");
    })
    .slice(0, limit)
    .map(({ id, title, rating, notes, tastedAt }) => ({
      id,
      title,
      rating,
      notes,
      tastedAt,
    }));
}

export function aggregateNotes(
  notes: TastingNote[],
  period: Period,
): AggregationResult {
  const { included, excludedWithoutDate } = filterNotesByPeriod(notes, period);
  const ratings = included
    .map((n) => n.rating)
    .filter((r): r is number => typeof r === "number");

  const averageRating =
    ratings.length > 0
      ? round1(ratings.reduce((a, b) => a + b, 0) / ratings.length)
      : null;

  const threshold = SAMPLE_THRESHOLDS[period.type];
  const insufficientSample = included.length < threshold;

  const ratingDistribution = countBy(
    ratings.map((r) => String(r)),
  );

  return {
    period,
    totalCount: included.length,
    excludedWithoutDate,
    ratedCount: ratings.length,
    averageRating,
    byColor: countBy(included.map((n) => n.color)),
    byCountry: countBy(included.map((n) => n.country)),
    byRegion: countBy(included.map((n) => n.region)),
    byGrape: countBy(included.flatMap((n) => n.grapes)),
    byProducer: countBy(included.map((n) => n.producer)),
    ratingDistribution,
    missingFieldRates: {
      rating: missingRate(included, "rating"),
      notes: missingRate(included, "notes"),
      region: missingRate(included, "region"),
      country: missingRate(included, "country"),
      grapes: missingRate(included, "grapes"),
      producer: missingRate(included, "producer"),
      color: missingRate(included, "color"),
    },
    insufficientSample,
    sampleNotes: pickSampleNotes(included),
  };
}
