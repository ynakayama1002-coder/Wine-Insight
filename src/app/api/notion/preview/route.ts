import { NextResponse } from "next/server";
import {
  describePropertyCoverage,
  fetchTastingNotes,
  getNotionConfigFromEnv,
} from "@/lib/notion/client";
import { aggregateNotes } from "@/lib/aggregate";
import type { Period } from "@/lib/types";

function defaultWeekPeriod(): Period {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  const toDate = (d: Date) => d.toISOString().slice(0, 10);
  return { type: "weekly", start: toDate(start), end: toDate(end) };
}

/**
 * Phase 1 確認用エンドポイント。
 * 本番では無効化または秘密ヘッダ必須にする（Phase 3）。
 */
export async function GET(request: Request) {
  const config = getNotionConfigFromEnv();
  if (!config) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "NOTION_API_KEY と NOTION_DATABASE_ID（または NOTION_DATA_SOURCE_ID）を .env.local に設定してください。",
        hint: "API キーなしでも npm test で mapper / aggregate を検証できます。",
      },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const period: Period =
    start && end
      ? { type: "weekly", start, end }
      : defaultWeekPeriod();

  try {
    const { notes, dataSourceId, propertyNames } = await fetchTastingNotes(
      config,
      period,
    );
    const aggregation = aggregateNotes(notes, period);

    return NextResponse.json({
      ok: true,
      dataSourceId,
      period,
      fetchedCount: notes.length,
      propertyNames,
      propertyCoverage: describePropertyCoverage(propertyNames),
      sample: notes.slice(0, 3).map(({ id, title, tastedAt, rating, grapes }) => ({
        id,
        title,
        tastedAt,
        rating,
        grapes,
      })),
      aggregation: {
        totalCount: aggregation.totalCount,
        excludedWithoutDate: aggregation.excludedWithoutDate,
        averageRating: aggregation.averageRating,
        insufficientSample: aggregation.insufficientSample,
        byColor: aggregation.byColor,
        byCountry: aggregation.byCountry,
        missingFieldRates: aggregation.missingFieldRates,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
