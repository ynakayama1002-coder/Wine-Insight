# 実装順序と検証チェックリスト

## Phase 1（今回）— Notion 取得まで

1. 設計ドキュメント作成 ✅
2. Next.js + TypeScript スキャフォルド ✅
3. 型 / property-map / mapper / aggregate ✅
4. fixture による unit test ✅
5. `GET /api/notion/preview` ✅
6. 実 Notion 接続はユーザー側で `.env.local` 設定後に確認

### 検証

- [x] `npm test` が緑（キー不要）
- [ ] preview API で `propertyCoverage` の `resolved` が主要フィールドで埋まる
- [ ] 想定と違うプロパティ名は `src/lib/notion/property-map.ts` のみ修正
- [ ] 書き込み系 API を呼んでいないこと

## Phase 2 — 解釈と永続化

1. Claude プロンプト（insufficientSample 対応）
2. Supabase `reports` / `run_logs` スキーマ
3. 重複防止（unique period）
4. `POST /api/reports/generate`

## Phase 3 — UI とデプロイ

1. スマホ優先レポート閲覧画面
2. Vercel デプロイ + secrets
3. preview API の保護 or 削除

## Phase 4 — 定期実行

1. GitHub Actions weekly / monthly cron
2. `CRON_SECRET` による保護
