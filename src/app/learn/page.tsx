import { db } from "@/db";
import { learningPaths, lessons, progress } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { GraduationCap, Clock, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-400",
  intermediate: "bg-amber-500/15 text-amber-400",
  advanced: "bg-rose-500/15 text-rose-400",
};

export default async function LearnPage() {
  const paths = await db.select().from(learningPaths).orderBy(asc(learningPaths.order));

  const counts = await db
    .select({ pathId: lessons.pathId, total: sql<number>`count(*)` })
    .from(lessons)
    .groupBy(lessons.pathId);

  const done = await db
    .select({ pathId: lessons.pathId, completed: sql<number>`count(*)` })
    .from(progress)
    .innerJoin(lessons, eq(lessons.id, progress.lessonId))
    .where(eq(progress.status, "completed"))
    .groupBy(lessons.pathId);

  const totalByPath = Object.fromEntries(counts.map((c) => [c.pathId, c.total]));
  const doneByPath = Object.fromEntries(done.map((d) => [d.pathId, d.completed]));

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <header className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
          <GraduationCap className="h-3 w-3" /> Rutas de aprendizaje
        </div>
        <h1 className="text-3xl font-bold">Tu camino al dominio profesional</h1>
        <p className="text-muted-foreground">Currículo progresivo, actualizado con el estado del arte. Empieza por donde estés.</p>
      </header>

      {paths.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          No hay rutas todavía. Ejecuta <code className="bg-muted px-1 rounded">npm run db:seed</code>.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {paths.map((p) => {
            const total = totalByPath[p.id] ?? 0;
            const completed = doneByPath[p.id] ?? 0;
            const pct = total ? Math.round((completed / total) * 100) : 0;
            return (
              <Link
                key={p.id}
                href={`/learn/${p.slug}`}
                className="group border border-border rounded-xl p-6 hover:border-primary/50 bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_COLOR[p.level] ?? "bg-muted text-muted-foreground"}`}>
                    {p.level}
                  </span>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.estimatedHours}h
                  </span>
                </div>
                <h2 className="text-lg font-semibold mb-2 group-hover:text-primary">{p.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{p.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="h-3 w-3" /> {total} lecciones
                  </span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
