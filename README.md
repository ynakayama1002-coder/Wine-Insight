# Wine Insight

Notion に蓄積したワインのテイスティング記録を分析し、スマートフォンで閲覧できる週次・月次レポートを自動生成する MVP。

元メモ: 祐輔のワインテイスティング記録・セラー在庫管理画面作成用リポジトリ。

## 現状（Phase 1）

- 設計ドキュメント: `docs/`
- Notion 取得レイヤー + ドメイン型 + 集計ロジック
- API キー不要の unit test（fixture ベース）
- 確認用 API: `GET /api/notion/preview`

Claude / Supabase / レポート UI / Vercel / GitHub Actions は **未実装**（動作確認後に進む）。

## セットアップ

```bash
npm install
cp .env.example .env.local
# NOTION_API_KEY と NOTION_DATABASE_ID（または NOTION_DATA_SOURCE_ID）を設定
```

Notion Integration の作り方・権限・DB 共有手順は `docs/02-notion-setup.md` を参照。

## 検証

```bash
# API キー不要
npm test

# キーあり
npm run dev
# http://localhost:3000/api/notion/preview
```

## ドキュメント

| ファイル | 内容 |
|---|---|
| `docs/01-design.md` | 要件・画面・データフロー・実装順序 |
| `docs/02-notion-setup.md` | Notion 接続と権限 |
| `docs/03-property-schema.md` | プロパティ構造（仮説） |
| `docs/04-types-and-aggregation.md` | 型と集計ルール |
