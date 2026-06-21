import { db } from "@/db";
import { learningPaths, lessons, progress } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import LessonComplete from "./LessonComplete";
import LessonChatMount from "./LessonChatMount";
import { GraduationCap, CheckCircle2, Circle } from "lucide-react";
import { levelMeta } from "@/lib/levels";

export const dynamic = "force-dynamic";

export default async function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = await db.select().from(learningPaths).where(eq(learningPaths.slug, slug)).limit(1);
  if (!path[0]) notFound();

  const ls = await db.select().from(lessons).where(eq(lessons.pathId, path[0].id)).orderBy(asc(lessons.order));
  const progressRows = await db.select().from(progress);
  const statusByLesson = new Map(progressRows.map((p) => [p.lessonId, p.status]));

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <header className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
          <GraduationCap className="h-3 w-3" /> {levelMeta(path[0].level).emoji} {levelMeta(path[0].level).label}
        </div>
        <h1 className="text-3xl font-bold">{path[0].title}</h1>
        <p className="text-muted-foreground">{path[0].description}</p>
      </header>

      <LessonChatMount
        courseTitle={path[0].title}
        lessons={ls.map((l) => ({ id: l.id, title: l.title, objective: l.objective }))}
      >
      <div className="space-y-6">
        {ls.map((l, i) => {
          const status = statusByLesson.get(l.id) ?? "not_started";
          const isDone = status === "completed";
          return (
            <article
              key={l.id}
              data-lesson-id={l.id}
              className="border border-border rounded-xl p-6 bg-card"
            >
              <div className="flex items-start gap-3 mb-4">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Lección {i + 1}</div>
                  <h2 className="text-xl font-semibold">{l.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{l.objective}</p>
                </div>
              </div>

              <div className="mb-4">
                <Markdown text={l.content} />
              </div>

              {l.exercises && (
                <details className="mt-4 border border-border rounded-lg">
                  <summary className="cursor-pointer px-4 py-3 font-medium text-sm hover:bg-accent/30">
                    Ejercicios prácticos
                  </summary>
                  <div className="px-4 pb-4">
                    <Markdown text={l.exercises} />
                  </div>
                </details>
              )}

              <LessonComplete lessonId={l.id} done={isDone} />
            </article>
          );
        })}
      </div>
      </LessonChatMount>
    </div>
  );
}
