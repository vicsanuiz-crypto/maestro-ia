import { db } from "@/db";
import { articles, briefings } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Newspaper, MessageSquare, GraduationCap, Sparkles, Rss, Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestBriefing = await db.select().from(briefings).orderBy(desc(briefings.date)).limit(1);
  const recentArticles = await db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(8);

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
          <Sparkles className="h-3 w-3" /> Tu tutor de IA, siempre al día
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Domina la IA. Nunca te quedes atrás.</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Maestro-IA rastrea las fuentes más relevantes del mundo de la IA, te entrega un briefing diario y te enseña a aplicar cada novedad como un profesional.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/briefing" className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
          <Newspaper className="h-6 w-6 text-primary mb-3" />
          <h2 className="font-semibold mb-1">Briefing de hoy</h2>
          {latestBriefing[0] ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">{latestBriefing[0].headline}</p>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {latestBriefing[0].date}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aún no hay briefing. Ejecuta <code className="bg-muted px-1 rounded">npm run ingest && npm run briefing</code>.</p>
          )}
          <div className="mt-4 text-primary text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Leer briefing <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        <Link href="/chat" className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
          <MessageSquare className="h-6 w-6 text-primary mb-3" />
          <h2 className="font-semibold mb-1">Pregunta al Maestro</h2>
          <p className="text-sm text-muted-foreground mb-2">Tu experto IA con contexto del feed actualizado. Pregúntale qué quieras dominar hoy.</p>
          <div className="mt-4 text-primary text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Abrir chat <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        <Link href="/learn" className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
          <GraduationCap className="h-6 w-6 text-primary mb-3" />
          <h2 className="font-semibold mb-1">Rutas de aprendizaje</h2>
          <p className="text-sm text-muted-foreground mb-2">De prompting básico a agentes, RAG, fine-tuning y MCP. Tu camino al dominio profesional.</p>
          <div className="mt-4 text-primary text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver rutas <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        <Link href="/feed" className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
          <Rss className="h-6 w-6 text-primary mb-3" />
          <h2 className="font-semibold mb-1">Feed en vivo</h2>
          <p className="text-sm text-muted-foreground mb-2">{recentArticles.length} artículos recientes de los labs y comunidades top.</p>
          <div className="mt-4 text-primary text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver feed <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </section>

      {recentArticles.length > 0 && (
        <section>
          <h2 className="font-semibold mb-4 text-lg">Lo más reciente del feed</h2>
          <ul className="space-y-2">
            {recentArticles.map((a) => (
              <li key={a.id} className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
                <a href={a.url} target="_blank" rel="noopener" className="block">
                  <div className="text-sm font-medium mb-1">{a.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{a.source}</span> · <span>{timeAgo(a.publishedAt)}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
