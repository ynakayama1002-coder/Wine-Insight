# Notion API 接続設定と権限

## 1. Integration の作成

1. [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) を開く
2. **New integration** を作成（例: `Wine Insight Reader`）
3. Type: **Internal**
4. Associated workspace: テイスティング DB があるワークスペース

### Capabilities（権限）

初期版は **読み取りのみ** にする。

| Capability | 設定 |
|---|---|
| Read content | ✅ 必須 |
| Update content | ❌ オフ |
| Insert content | ❌ オフ |
| Read user information | 任意（不要ならオフ） |

→ 書き込みをオフにすることで「Notion 正本・アプリは読み取り専用」を技術的に担保する。

## 2. データベースを Integration と共有

Notion API は Integration にページ／DB を共有しないと **404** になる。

1. テイスティングノートの Database を開く
2. 右上 `•••` → **Add connections**（または Connections）
3. 作成した Integration を選択して接続

## 3. ID の取得

### Database ID

DB をブラウザで開いたときの URL:

```
https://www.notion.so/{workspace}/{database_id}?v=...
```

`database_id` は 32 桁の hex（ハイフン無し）。環境変数ではハイフン付き UUID 形式でも可。

### Data Source ID（API 2025-09-03 以降）

Notion API `2025-09-03` 以降、Database と Data Source が分離された。

- `GET /v1/databases/{database_id}` → `data_sources[]` を取得
- クエリは `POST /v1/data_sources/{data_source_id}/query`

Phase 1 実装では `@notionhq/client` の安定版に合わせ、まず **Database ID で query** する方式を採用する。SDK / API バージョン更新時に Data Source 対応へ切り替える。

## 4. 環境変数

```bash
# .env.local（git に含めない）
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Vercel / GitHub Actions には同じキーを Secrets として登録する（Phase 3）。

## 5. 接続確認手順

```bash
# 依存インストール後
npm run test          # キー不要の unit test
npm run dev           # ローカル起動
# ブラウザで /api/notion/preview を開き、件数と生プロパティを確認
```

失敗時の典型:

| HTTP | 原因 |
|---|---|
| 401 | API Key 誤り |
| 403 | Capability 不足（Read content が無い） |
| 404 | DB が Integration に共有されていない / ID 誤り |

## 6. セキュリティ

- Client Component や `NEXT_PUBLIC_*` にキーを載せない
- Notion 取得は Server Action / Route Handler のみ
- preview API は本番では無効化、または `CRON_SECRET` 相当で保護する（Phase 3）
