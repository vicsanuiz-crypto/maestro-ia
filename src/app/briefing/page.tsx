import { db } from "@/db";
import { briefings, articles } from "@/db/schema";
import { desc, inArray } from "drizzle-orm";
import { Markdown } from "@/components/Markdown";
import { formatDate, timeAgo } from "@/lib/utils";
import { Newspaper, Clock } from "lucide-react";
import RegenerateButton from "./RegenerateButton";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  const all = await db.select().from(briefings).orderBy(desc(briefings.date)).limit(10);
  const latest = all[0];

  let highlighted: typeof articles.$inferSelect[] = [];
  if (latest) {
    const ids = JSON.parse(latest.articleIds) as number[];
    if (ids.length) {
      highlighted = await db.select().from(articles).where(inArray(articles.id, ids));
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
            <Newspaper className="h-3 w-3" /> Briefing diario
          </div>
          <h1 className="text-3xl font-bold">Maestro-IA Daily</h1>
          {latest && (
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Generado {timeAgo(latest.createdAt)}
            </div>
          )}
        </div>
        <RegenerateButton />
      </header>

      {!latest ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground mb-4">No hay briefings aún. Genera el primero:</p>
          <pre className="bg-muted p-4 rounded text-sm text-left max-w-md mx-auto"><code>{`npm run ingest
npm run briefing`}</code></pre>
        </div>
      ) : (
        <>
          <div className="mb-8 pb-8 border-b border-border">
            <div className="text-sm text-muted-foreground mb-2">{formatDate(latest.date)}</div>
            <h2 className="text-2xl font-bold mb-4">{latest.headline}</h2>
            <Markdown text={latest.summary} />
          </div>

          <section className="mb-8">
            <h3 className="font-semibold text-lg mb-3">Para hacer hoy</h3>
            <Markdown text={latest.keyTakeaways} />
          </section>

          {latest.trends && (
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">Tendencias</h3>
              <Markdown text={latest.trends} />
            </section>
          )}

          {highlighted.length > 0 && (
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">Lecturas destacadas</h3>
              <ul className="space-y-2">
                {highlighted.map((a) => (
                  <li key={a.id} className="border border-border rounded-lg p-4">
                    <a href={a.url} target="_blank" rel="noopener" className="block hover:text-primary">
                      <div className="font-medium mb-1">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.source}</div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {all.length > 1 && (
            <section>
              <h3 className="font-semibold text-lg mb-3">Briefings anteriores</h3>
              <ul className="space-y-1">
                {all.slice(1).map((b) => (
                  <li key={b.id} className="text-sm">
                    <span className="text-muted-foreground mr-2">{b.date}</span>
                    <span>{b.headline}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
