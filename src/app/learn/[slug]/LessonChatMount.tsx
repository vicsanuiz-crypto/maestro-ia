"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import LessonChatWidget from "./LessonChatWidget";
import type { LessonContext } from "@/hooks/useLessonChat";

type LessonMeta = {
  id: number;
  title: string;
  objective?: string | null;
};

type Props = {
  courseTitle: string;
  lessons: LessonMeta[];
  children: React.ReactNode;
};

/**
 * Envuelve la lista de lecciones y:
 * 1. Detecta la lección "activa" por scroll (IntersectionObserver sobre los
 *    [data-lesson-id] que renderiza la página). No hay ruta por lección.
 * 2. Mientras el panel está cerrado, la lección activa sigue al scroll. Al
 *    abrirlo, se congela: evita que un scroll accidental reinicie el chat a
 *    mitad de conversación (el reinicio "al cambiar de lección" del requisito
 *    ocurre al navegar/scrollear con el panel cerrado).
 * 3. En >=1280px reserva padding-right cuando el panel está abierto, para que
 *    el panel lateral NO tape el contenido principal.
 */
export default function LessonChatMount({ courseTitle, lessons, children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<number | null>(lessons[0]?.id ?? null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-lesson-id]")
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (openRef.current) return; // congelado mientras el chat está abierto
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = Number(
            (visible.target as HTMLElement).dataset.lessonId
          );
          if (!Number.isNaN(id)) setActiveId(id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.5, 1] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeId) ?? lessons[0],
    [lessons, activeId]
  );

  if (!activeLesson) return <>{children}</>;

  const ctx: LessonContext = {
    lessonId: activeLesson.id,
    courseTitle,
    lessonTitle: activeLesson.title,
    lessonObjective: activeLesson.objective ?? null,
    getVisibleExcerpt: () => {
      const el = wrapperRef.current?.querySelector<HTMLElement>(
        `[data-lesson-id="${activeLesson.id}"]`
      );
      const text = el?.innerText?.replace(/\s+/g, " ").trim();
      return text ? text.slice(0, 1500) : undefined;
    },
  };

  return (
    <div
      ref={wrapperRef}
      className={open ? "transition-all xl:pr-[400px]" : "transition-all"}
    >
      {children}
      <LessonChatWidget ctx={ctx} open={open} onOpenChange={setOpen} />
    </div>
  );
}
