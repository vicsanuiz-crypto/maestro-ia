import { NextRequest } from "next/server";
import {
  ai,
  getActiveModel,
  MAESTRO_SYSTEM_PROMPT,
  buildContextBlock,
  buildLessonSystemPrompt,
  buildSystemInstruction,
  type LessonContext,
} from "@/lib/claude";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const { messages, lessonContext } = (await req.json()) as {
    messages: Msg[];
    lessonContext?: LessonContext;
  };
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  // Modo lección: si llega lessonContext, el tutor se acota a esa lección y
  // NO se inyecta el contexto del feed. Si no, comportamiento original (/chat).
  let systemInstruction: string;
  if (lessonContext?.courseTitle && lessonContext?.lessonTitle) {
    systemInstruction = buildLessonSystemPrompt(lessonContext);
  } else {
    const recent = await db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(25);
    const contextBlock = buildContextBlock(
      recent.map((a) => ({
        title: a.title,
        source: a.source,
        url: a.url,
        summary: a.rawContent?.slice(0, 400),
        publishedAt: a.publishedAt,
      }))
    );
    systemInstruction = buildSystemInstruction(MAESTRO_SYSTEM_PROMPT, contextBlock);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const geminiStream = await ai.models.generateContentStream({
          model: getActiveModel(),
          config: {
            systemInstruction,
            // El thinking de Gemini 2.5 consume tokens de salida; sin holgura las
            // respuestas del chat salen vacías o cortadas. Damos margen y
            // desactivamos el razonamiento extendido (el tutor responde directo).
            maxOutputTokens: 4096,
            thinkingConfig: { thinkingBudget: 0 },
          },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        });

        for await (const chunk of geminiStream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
        controller.close();
      } catch (e) {
        controller.enqueue(encoder.encode(`\n\n[Error: ${(e as Error).message}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache" },
  });
}
