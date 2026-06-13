"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type ChatMsg = { role: "user" | "assistant"; content: string };

/** Contexto de la lección que se envía como `lessonContext` a /api/chat. */
export type LessonContext = {
  lessonId: number;
  courseTitle: string;
  lessonTitle: string;
  lessonObjective?: string | null;
  /** Fragmento del contenido visible; se resuelve perezosamente al enviar. */
  getVisibleExcerpt?: () => string | undefined;
};

const sessionKey = (lessonId: number) => `lesson-chat:${lessonId}`;

/**
 * Lógica de mensajes del chat de lección.
 *
 * - El historial PERSISTE durante la sesión (sessionStorage, por lessonId).
 * - Al cambiar de lección, `ctx.lessonId` cambia → se carga otra clave →
 *   el historial efectivamente se REINICIA para la nueva lección.
 * - Streaming incremental igual que el chat principal (text/plain).
 */
export function useLessonChat(ctx: LessonContext) {
  const { lessonId } = ctx;
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Cargar historial de la lección activa (reinicio implícito al cambiar de id).
  useEffect(() => {
    abortRef.current?.abort();
    setLoading(false);
    try {
      const raw = sessionStorage.getItem(sessionKey(lessonId));
      setMessages(raw ? (JSON.parse(raw) as ChatMsg[]) : []);
    } catch {
      setMessages([]);
    }
  }, [lessonId]);

  // Persistir mientras dure la sesión del navegador.
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      sessionStorage.setItem(sessionKey(lessonId), JSON.stringify(messages));
    } catch {
      /* cuota llena: no es crítico, seguimos en memoria */
    }
  }, [messages, lessonId]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const next: ChatMsg[] = [...messages, { role: "user", content: trimmed }];
      setMessages(next);
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: next,
            lessonContext: {
              courseTitle: ctx.courseTitle,
              lessonTitle: ctx.lessonTitle,
              lessonObjective: ctx.lessonObjective ?? null,
              visibleExcerpt: ctx.getVisibleExcerpt?.() ?? null,
            },
          }),
        });
        if (!res.body) throw new Error("Sin stream de respuesta");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        setMessages([...next, { role: "assistant", content: "" }]);
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages([...next, { role: "assistant", content: acc }]);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setMessages([
          ...next,
          { role: "assistant", content: `Error: ${(e as Error).message}` },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, ctx]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    try {
      sessionStorage.removeItem(sessionKey(lessonId));
    } catch {
      /* noop */
    }
  }, [lessonId]);

  return { messages, loading, send, reset };
}
