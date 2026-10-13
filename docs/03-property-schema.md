# テイスティングノート — プロパティ構造（仮説）

実際の Notion DB スキーマはユーザー環境依存のため、**想定プロパティ**を定義し、実行時に `property-map.ts` で名前マッピングする。

Phase 1 の `/api/notion/preview` で実プロパティ一覧を出し、差異があればマップだけ直す。

## 想定プロパティ

| 論理名 | Notion 想定名（日本語） | Notion 型 | 必須 | 用途 |
|---|---|---|---|---|
| `title` | ワイン名 / Name | title | ✅ | 表示名 |
| `tastedAt` | テイスティング日 | date | ✅ | 期間フィルタ |
| `producer` | 生産者 | rich_text / select | | 集計 |
| `region` | 産地 | select / rich_text | | 集計 |
| `country` | 国 | select | | 集計 |
| `grape` | 品種 | multi_select / select | | 集計 |
| `vintage` | ヴィンテージ | number / rich_text | | 集計 |
| `color` | 色 | select | | 集計（赤/白/ロゼ等） |
| `rating` | 評価 | number | | 平均・分布 |
| `price` | 価格 | number | | 任意集計 |
| `notes` | テイスティングノート | rich_text | | AI 解釈入力 |
| `occasion` | シーン | select | | 任意 |
| `cellar` | セラー由来 | checkbox | | 任意 |

## 未入力の扱い

- `null` / 空配列のまま保持する（推測補完しない）
- 集計時は「有効な値があるレコードのみ」を母数にする
- レポートに `missingFieldRates` を含め、欠損率を可視化する

## ページ本文（blocks）

初期版は **DB プロパティのみ** 使う。ページ本文のブロック取得は Phase 2 以降（ノートがプロパティに無い場合に追加）。

## スキーマ突合チェックリスト

preview API 実行後:

1. [ ] `tastedAt` に相当する date プロパティがあるか
2. [ ] title プロパティ名は何か
3. [ ] 評価は number か select（★）か
4. [ ] 品種は multi_select か relation か
5. [ ] 想定外プロパティで集計したいものがあるか
