import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";
import { Rss, ExternalLink } from "lucide-react";
import IngestButton from "./IngestButton";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  lab: "Labs",
  research: "Research",
  news: "News",
  community: "Community",
  tools: "Tools",
};

export default async function FeedPage() {
  const all = await db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(100);
  const byCategory = all.reduce<Record<string, typeof all>>((acc, a) => {
    const cat = a.category ?? "news";
    (acc[cat] ||= []).push(a);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">
            <Rss className="h-3 w-3" /> Feed agregado
          </div>
          <h1 className="text-3xl font-bold">Lo último en IA</h1>
          <p className="text-muted-foreground mt-1">{all.length} artículos de {Object.keys(byCategory).length} categorías</p>
        </div>
        <IngestButton />
      </header>

      {all.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Feed vacío. Pulsa "Refrescar feed" o ejecuta <code className="bg-muted px-1 rounded">npm run ingest</code>.
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, list]) => (
          <section key={cat} className="mb-10">
            <h2 className="font-semibold text-lg mb-3 uppercase tracking-wide text-xs text-muted-foreground">
              {CATEGORY_LABEL[cat] ?? cat}
            </h2>
            <ul className="space-y-2">
              {list.slice(0, 25).map((a) => (
                <li key={a.id} className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
                  <a href={a.url} target="_blank" rel="noopener" className="block group">
                    <div className="font-medium mb-1 group-hover:text-primary flex items-start gap-2">
                      <span className="flex-1">{a.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 mt-1 opacity-50 group-hover:opacity-100" />
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="font-medium">{a.source}</span>
                      <span>·</span>
                      <span>{timeAgo(a.publishedAt)}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
