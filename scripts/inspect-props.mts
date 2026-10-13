import { readFileSync } from "node:fs";
import { Client } from "@notionhq/client";

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

const client = new Client({ auth: process.env.NOTION_API_KEY! });
const db = await client.databases.retrieve({
  database_id: process.env.NOTION_DATABASE_ID!,
});
const dsId = (db as { data_sources: Array<{ id: string }> }).data_sources[0].id;
const ds = await client.dataSources.retrieve({ data_source_id: dsId });

const want = [
  "評価",
  "地域",
  "テイスティングコメント",
  "ワイン名",
  "品種",
  "好み",
  "品質",
  "今日の気づき",
  "AOC / DOC / DOCG等",
  "Vintage",
];

const types: Record<string, unknown> = {};
for (const name of want) {
  const p = (
    ds.properties as Record<string, { type: string; select?: { options?: Array<{ name: string }> }; number?: { format?: string } }>
  )[name];
  if (!p) {
    types[name] = null;
    continue;
  }
  types[name] = {
    type: p.type,
    ...(p.type === "select"
      ? { options: (p.select?.options || []).map((o) => o.name) }
      : {}),
    ...(p.type === "number" ? { format: p.number?.format } : {}),
  };
}

const q = await client.dataSources.query({
  data_source_id: dsId,
  page_size: 5,
});

const samples = q.results.slice(0, 5).map((page) => {
  const props = (page as { properties: Record<string, { type: string } & Record<string, unknown>> }).properties;
  const pick = (n: string) => {
    const p = props[n];
    if (!p) return null;
    return { type: p.type, raw: p[p.type] };
  };
  return {
    rating: pick("評価"),
    region: pick("地域"),
    notes: pick("テイスティングコメント"),
    preference: pick("好み"),
    quality: pick("品質"),
  };
});

console.log(JSON.stringify({ types, samples }, null, 2));
