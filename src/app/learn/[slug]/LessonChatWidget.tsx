"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageCircle, X, Sparkles, RotateCcw } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { useLessonChat, type LessonContext } from "@/hooks/useLessonChat";

type Props = {
  ctx: LessonContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Widget de chat flotante anclado a la lección activa.
 *
 * - Botón flotante (esquina inferior derecha) que colapsa/expande el panel.
 * - >=1280px (xl): panel lateral; el contenedor de lecciones reserva espacio
 *   (ver LessonChatMount), así que NO tapa el contenido principal.
 * - <1280px: actúa como bottom sheet a ancho completo.
 * - Coexiste con el chat del maestro humano: esto es solo el tutor IA in-situ.
 */
export default function LessonChatWidget({ ctx, open, onOpenChange }: Props) {
  const { messages, loading, send, reset } = useLessonChat(ctx);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const suggestions = [
    `Explícame el objetivo de "${ctx.lessonTitle}" con un ejemplo`,
    "Hazme una pregunta para comprobar si lo entendí",
    "Resume los puntos clave de esta lección",
  ];

  function submit(text: string) {
    send(text);
    setInput("");
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Cerrar tutor de la lección" : "Abrir tutor de la lección"}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg grid place-items-center hover:opacity-90 transition-opacity"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Tutor de la lección"
          className="fixed z-40 flex flex-col bg-card border border-border shadow-2xl
                     inset-x-0 bottom-0 h-[75vh] rounded-t-2xl
                     xl:inset-x-auto xl:bottom-24 xl:right-5 xl:h-[70vh] xl:w-[380px] xl:rounded-2xl"
        >
          {/* Cabecera con el contexto de la lección activa */}
          <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-border">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{ctx.courseTitle}</span>
              </div>
              <div className="font-semibold text-sm truncate">{ctx.lessonTitle}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={reset}
                aria-label="Reiniciar conversación"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Cerrar"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 xl:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Pregunta sobre esta lección. El tutor solo responde dentro de su ámbito.
                </p>
                <div className="grid gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="text-left text-xs px-3 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%] text-sm"
                      : "max-w-full text-sm"
                  }
                >
                  {m.role === "user" ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <Markdown text={m.content} />
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando sobre la lección...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="border-t border-border p-3 flex gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder="Pregunta sobre esta lección..."
              rows={1}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary text-primary-foreground rounded-lg px-3 py-2 hover:opacity-90 disabled:opacity-50 inline-flex items-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
