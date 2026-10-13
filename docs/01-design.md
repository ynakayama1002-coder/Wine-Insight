# Wine Insight MVP — 設計提案

## 1. 目的とスコープ

Notion に蓄積したワインのテイスティング記録を読み取り、週次・月次の洞察レポートをスマートフォンで閲覧できる Web アプリを作る。

| 含む（MVP） | 含まない（初期版） |
|---|---|
| Notion からの読み取り | Notion への書き込み |
| 定量集計（プログラム） | 未入力値の推測補完 |
| 定性解釈（Claude） | セラー在庫の編集 UI |
| レポート履歴（Supabase） | 多ユーザー認証 |
| 週次・月次レポート閲覧 | リアルタイム同期 |
| GitHub Actions 定期実行 | 複雑なダッシュボード |

---

## 2. 要件（初期版）

### 機能要件

1. **データ取得**: Notion DB からテイスティング記録を期間指定で取得する
2. **定量集計**: 本数・産地・品種・評価などの集計をコードで行う
3. **AI 解釈**: 集計結果 + ノート要約を Claude に渡し、傾向コメントを生成する（記録が少ない場合は断定しない）
4. **重複防止**: 同じ `period_type` + `period_start` + `period_end` のレポートは再生成しない
5. **閲覧**: スマートフォン優先で最新レポートと履歴を見る
6. **実行ログ**: 成功・失敗・スキップを Supabase に残す

### 非機能要件

- 秘密情報はサーバー側（Vercel / Actions secrets）のみ
- Notion を正本とし、アプリは読み取り専用
- 段階実装: まず Notion 取得を動作確認してから次工程へ

---

## 3. 画面構成（スマホ優先）

```
┌─────────────────────────┐
│ Wine Insight            │  ← ブランド（ヘッダー）
├─────────────────────────┤
│ [今週] [今月] [履歴]    │  ← セグメント切替
├─────────────────────────┤
│ 2026-W41 週次レポート   │
│ 記録: 5本               │
│                         │
│ ■ サマリー（AI）        │
│ ■ 集計チャート          │
│ ■ 注目ノート抜粋        │
│ ■ 生成日時 / データ源   │
└─────────────────────────┘
```

| 画面 | 内容 | 実装順 |
|---|---|---|
| `/` | 最新レポート（週 or 月） | Phase 3 |
| `/reports/[id]` | レポート詳細 | Phase 3 |
| `/reports` | 履歴一覧 | Phase 3 |
| `/api/notion/preview` | 取得件数・プロパティ確認（開発用） | **Phase 1** |
| `/api/reports/generate` | 手動生成トリガー（保護付き） | Phase 2 |

Phase 1 では UI は最小（プレビュー用のプレーンな確認ページ）に留め、レポート閲覧 UI は後続とする。

---

## 4. データフロー

```
Notion DB (正本)
    │  read-only
    ▼
[Next.js Server] ── fetchTastingNotes(period)
    │
    ├─► aggregateNotes(notes)     ← プログラム集計（決定論）
    │
    ├─► Claude API                ← 定性解釈のみ
    │         │
    │         ▼
    └─► Supabase reports / run_logs
              │
              ▼
         スマホ UI (SSR/RSC)
```

定期実行: GitHub Actions → `POST /api/reports/generate`（cron secret）

---

## 5. API 連携方式

| サービス | 用途 | 認証 | 備考 |
|---|---|---|---|
| Notion | 記録取得 | Internal Integration Token | 書き込み権限不要 |
| Claude | 解釈文生成 | API Key（サーバーのみ） | Phase 2 |
| Supabase | レポート・ログ保存 | Service Role（サーバーのみ） | Phase 2 |
| Vercel | ホスティング | — | Phase 3 |
| GitHub Actions | 週次/月次 cron | `CRON_SECRET` | Phase 3 |

### 環境変数（予定）

```
NOTION_API_KEY=
NOTION_DATABASE_ID=          # または DATA_SOURCE_ID
ANTHROPIC_API_KEY=           # Phase 2
SUPABASE_URL=                # Phase 2
SUPABASE_SERVICE_ROLE_KEY=   # Phase 2
CRON_SECRET=                 # Phase 3
```

---

## 6. 実装順序（段階確認）

| Phase | 成果物 | 検証 |
|---|---|---|
| **1（今回）** | 設計書・型・集計・Notion 取得・モックテスト | API キーなしで unit test 緑 / キーありで preview |
| 2 | Claude 解釈 + Supabase 保存 + 重複防止 | 同一期間の再実行が skip |
| 3 | スマホ UI + Vercel デプロイ | 実機ブラウザで閲覧 |
| 4 | GitHub Actions 定期実行 | Actions ログで成功確認 |

---

## 7. 検証方法（Phase 1）

1. **API キー不要**: `fixtures/notion-pages.json` を使った mapper / aggregate の unit test
2. **キーあり（任意）**: `NOTION_API_KEY` + `NOTION_DATABASE_ID` を `.env.local` に設定し、`/api/notion/preview` で件数とプロパティ名を確認
3. **スキーマ突合**: 実際の Notion プロパティ名が想定と違う場合は `src/lib/notion/property-map.ts` のみ修正

---

## 8. 重複防止・少ない記録への方針

- DB 制約: `UNIQUE (period_type, period_start, period_end)`
- 生成前に既存行があれば `skipped_duplicate` で終了
- 記録数しきい値（案）: 週次 < 3本 / 月次 < 5本 → AI プロンプトに「傾向を断定しない」を明示し、UI にも「サンプル不足」バッジ
