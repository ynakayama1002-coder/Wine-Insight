import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 px-5 py-10">
      <header className="space-y-2">
        <p className="text-sm tracking-wide text-[var(--muted)]">Phase 1</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--ink)]">
          Wine Insight
        </h1>
        <p className="text-base leading-relaxed text-[var(--muted)]">
          Notion
          のテイスティング記録を読み取り、週次・月次レポートへ進むための基盤です。この段階ではデータ取得の確認まで。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--ink)]">次の確認</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--muted)]">
          <li>
            <code className="rounded bg-[var(--chip)] px-1.5 py-0.5 text-[var(--ink)]">
              npm test
            </code>
            で API キーなしの mapper / 集計テスト
          </li>
          <li>
            <code className="rounded bg-[var(--chip)] px-1.5 py-0.5 text-[var(--ink)]">
              .env.local
            </code>
            に Notion キーを設定（
            <code className="rounded bg-[var(--chip)] px-1.5 py-0.5">docs/02-notion-setup.md</code>
            ）
          </li>
          <li>
            <Link
              href="/api/notion/preview"
              className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            >
              /api/notion/preview
            </Link>
            で取得件数とプロパティ突合を確認
          </li>
        </ol>
      </section>

      <section className="space-y-2 border-t border-[var(--line)] pt-6 text-sm text-[var(--muted)]">
        <p>設計ドキュメント</p>
        <ul className="space-y-1">
          <li>docs/01-design.md</li>
          <li>docs/02-notion-setup.md</li>
          <li>docs/03-property-schema.md</li>
          <li>docs/04-types-and-aggregation.md</li>
        </ul>
      </section>
    </main>
  );
}
