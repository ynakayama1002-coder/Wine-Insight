# テイスティングノート — プロパティ構造（実DB突合済み）

実 Notion DB を `/api/notion/preview` および smoke 取得で確認済み。

## 論理フィールド ↔ 実プロパティ

| 論理名 | 実プロパティ名 | Notion 型 | 備考 |
|---|---|---|---|
| `title` | ワイン名 | title | |
| `tastedAt` | テイスティング日 | date | |
| `producer` | 生産者 | rich_text | |
| `region` | 地域 | rich_text | 「産地」ではない |
| `country` | 国 | select | |
| `grape` | 品種 | multi_select | |
| `vintage` | Vintage | number | |
| `color` | 色 | select | 赤 / 白 / スパークリング 等 |
| `rating` | 好み | select | ★〜★★★★★ → 1〜5 |
| `notes` | テイスティングコメント | rich_text | |
| `occasion` | 場所 | select / 他 | |

## 重要: 「評価」と「好み」

| プロパティ | 型 | 意味 | MVP での扱い |
|---|---|---|---|
| 好み | select（★） | 主観スコア | → `rating`（数値化） |
| 評価 | multi_select | 感覚タグ（丸みのある、等） | Phase 1 では未使用 |

## その他の実プロパティ（未マッピング）

品質、ボディ、酸味強度、タンニン量、香りの強さ、果実、花、スパイス、ハーブ、
今日の気づき、ペアリング、AOC / DOC / DOCG等、余韻、バランス、複雑性 など（計38）。

AI 解釈で必要になったら Phase 2 以降で段階的に取り込む。

## 未入力の扱い

- `null` / 空配列のまま保持（推測補完しない）
- 集計時は有効値があるレコードのみを母数にする
