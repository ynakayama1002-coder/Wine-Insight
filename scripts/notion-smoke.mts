import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  process.env[m[1].trim()] ??= v;
}

const {
  fetchTastingNotes,
  getNotionConfigFromEnv,
  describePropertyCoverage,
} = await import("../src/lib/notion/client.ts");
const { aggregateNotes } = await import("../src/lib/aggregate.ts");

const config = getNotionConfigFromEnv();
if (!config) {
  console.log(JSON.stringify({ ok: false, error: "env missing" }, null, 2));
  process.exit(1);
}

try {
  const { notes, dataSourceId, propertyNames } = await fetchTastingNotes(config);
  const coverage = describePropertyCoverage(propertyNames);
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 29);
  const toDate = (d: Date) => d.toISOString().slice(0, 10);
  const period = {
    type: "monthly" as const,
    start: toDate(start),
    end: toDate(end),
  };
  const aggregation = aggregateNotes(notes, period);
  console.log(
    JSON.stringify(
      {
        ok: true,
        dataSourceId,
        propertyCount: propertyNames.length,
        propertyNames,
        propertyCoverage: coverage,
        fetchedCount: notes.length,
        sample: notes.slice(0, 3).map((n) => ({
          title: n.title,
          tastedAt: n.tastedAt,
          rating: n.rating,
          grapes: n.grapes,
          color: n.color,
          country: n.country,
          producer: n.producer,
        })),
        last30days: {
          totalCount: aggregation.totalCount,
          averageRating: aggregation.averageRating,
          insufficientSample: aggregation.insufficientSample,
          byColor: aggregation.byColor,
          byCountry: aggregation.byCountry,
          missingFieldRates: aggregation.missingFieldRates,
        },
      },
      null,
      2,
    ),
  );
} catch (e: unknown) {
  const err = e as { code?: string; status?: number; message?: string };
  console.log(
    JSON.stringify(
      {
        ok: false,
        code: err.code || err.status || null,
        message: err.message || String(e),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
