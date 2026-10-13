import { Client } from "@notionhq/client";
import type { Period, TastingNote } from "@/lib/types";
import {
  mapNotionPageToTastingNote,
  type NotionPageLike,
} from "@/lib/notion/map-page";
import { PROPERTY_MAP, resolvePropertyName } from "@/lib/notion/property-map";

export interface NotionConfig {
  apiKey: string;
  /** Database ID（UUID）。dataSourceId が無い場合に resolve する */
  databaseId?: string;
  /** Data Source ID。分かっていれば直接指定（推奨） */
  dataSourceId?: string;
}

export function getNotionConfigFromEnv(): NotionConfig | null {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  const databaseId = process.env.NOTION_DATABASE_ID?.trim();
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID?.trim();
  if (!apiKey) return null;
  if (!databaseId && !dataSourceId) return null;
  return { apiKey, databaseId, dataSourceId };
}

export function createNotionClient(apiKey: string): Client {
  return new Client({ auth: apiKey });
}

/** Database ID から最初の data_source_id を解決 */
export async function resolveDataSourceId(
  client: Client,
  databaseId: string,
): Promise<string> {
  const db = await client.databases.retrieve({ database_id: databaseId });
  const sources =
    "data_sources" in db && Array.isArray(db.data_sources)
      ? db.data_sources
      : [];
  if (sources.length === 0) {
    throw new Error(
      `Database ${databaseId} に data_source がありません。Notion API バージョンと共有設定を確認してください。`,
    );
  }
  return sources[0].id;
}

/**
 * 期間内のテイスティングノートを取得する。
 * tastedAt プロパティが解決できない場合はフィルタなしで全件取得し、
 * 呼び出し側の集計で日付欠損を除外する。
 */
export async function fetchTastingNotes(
  config: NotionConfig,
  period?: Period,
): Promise<{
  notes: TastingNote[];
  dataSourceId: string;
  propertyNames: string[];
}> {
  const client = createNotionClient(config.apiKey);
  const dataSourceId =
    config.dataSourceId ??
    (config.databaseId
      ? await resolveDataSourceId(client, config.databaseId)
      : (() => {
          throw new Error("databaseId または dataSourceId が必要です");
        })());

  // スキーマからプロパティ名を取得
  const dataSource = await client.dataSources.retrieve({
    data_source_id: dataSourceId,
  });
  const propertyNames = Object.keys(dataSource.properties ?? {});
  const tastedAtName = resolvePropertyName(propertyNames, "tastedAt");

  const pages: NotionPageLike[] = [];
  let cursor: string | undefined;

  do {
    const filter =
      period && tastedAtName
        ? {
            and: [
              {
                property: tastedAtName,
                date: { on_or_after: period.start },
              },
              {
                property: tastedAtName,
                date: { on_or_before: period.end },
              },
            ],
          }
        : undefined;

    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
      filter,
    });

    for (const result of response.results) {
      if (
        result &&
        typeof result === "object" &&
        "properties" in result &&
        result.properties
      ) {
        pages.push(result as unknown as NotionPageLike);
      }
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return {
    notes: pages.map(mapNotionPageToTastingNote),
    dataSourceId,
    propertyNames,
  };
}

/** デバッグ: 想定マップと実プロパティの突合結果 */
export function describePropertyCoverage(propertyNames: string[]) {
  const fields = Object.keys(PROPERTY_MAP) as (keyof typeof PROPERTY_MAP)[];
  return fields.map((field) => ({
    field,
    candidates: [...PROPERTY_MAP[field]],
    resolved: resolvePropertyName(propertyNames, field),
  }));
}
