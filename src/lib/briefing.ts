import { db } from "@/db";
import { articles, briefings } from "@/db/schema";
import { desc, gte } from "drizzle-orm";
import { Type } from "@google/genai";
import { ai, getActiveModel } from "./claude";

const BRIEFING_SYSTEM = `Eres el editor jefe de "Maestro-IA Daily", un briefing diario sobre IA dirigido a un profesional que quiere mantenerse a la vanguardia.

Tu trabajo: leer los artículos del día y producir un briefing JSON con esta estructura exacta:

{
  "headline": "Una frase tipo titular (max 100 chars) que capture LO MÁS importante del día",
  "summary": "2-3 párrafos en markdown explicando el panorama del día. Conecta noticias, no las listes. Señala patrones.",
  "keyTakeaways": "Lista markdown de 4-6 bullets accionables. Cada uno empieza con verbo ('Probar X', 'Leer Y', 'Investigar Z') Y DEBE incluir un enlace markdown directo [texto](URL) al artículo o recurso concreto que permite realizar la tarea, para que el usuario haga clic y vaya directo al contenido.",
  "trends": "1 párrafo sobre tendencias emergentes que estos artículos revelan",
  "highlighted": [array de números de los 3-5 artículos MÁS importantes]
}

Reglas:
- Filtra ruido. Si solo hay hype, dilo.
- Prioriza: papers con resultados, releases de modelos, herramientas usables HOY, cambios en pricing/acceso.
- Despriorizá: especulación, declaraciones corporativas vacías, opiniones.
- Español neutro, técnico pero claro.
- ENLACES: en keyTakeaways usa SIEMPRE las URLs EXACTAS que aparecen en el campo "URL:" de cada artículo de la lista. Nunca inventes, acortes ni modifiques una URL. Cada tarea debe enlazar al artículo del que surge.
- Devuelve SOLO el JSON, sin texto adicional.`;

export async function generateDailyBriefing(date = new Date()): Promise<{ id: number; date: string }> {
  const dateStr = date.toISOString().slice(0, 10);
  const since = new Date(date.getTime() - 36 * 60 * 60 * 1000);

  const recent = await db
    .select()
    .from(articles)
    .where(gte(articles.publishedAt, since))
    .orderBy(desc(articles.publishedAt))
    .limit(40);

  if (!recent.length) throw new Error("No articles to build briefing");

  const articleList = recent
    .map((a, i) => `[${i + 1}] (${a.source}) ${a.title}\nURL: ${a.url}\nResumen: ${(a.rawContent ?? "").slice(0, 500)}`)
    .join("\n\n");

  const res = await ai.models.generateContent({
    model: getActiveModel(),
    config: {
      systemInstruction: BRIEFING_SYSTEM,
      // Gemini 2.5 gasta tokens de "thinking" que cuentan contra este límite.
      // Damos holgura para que el JSON nunca se trunque (-> JSON inválido -> 500).
      maxOutputTokens: 8192,
      // El briefing es una tarea estructurada: no necesita razonamiento extendido.
      // Desactivar el thinking lo hace más rápido, barato y predecible.
      thinkingConfig: { thinkingBudget: 0 },
      // Modo JSON estructurado: Gemini garantiza una respuesta parseable con
      // exactamente esta forma. Elimina el parseo frágil con regex.
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          summary: { type: Type.STRING },
          keyTakeaways: { type: Type.STRING },
          trends: { type: Type.STRING },
          highlighted: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        },
        required: ["headline", "summary", "keyTakeaways", "trends", "highlighted"],
      },
    },
    contents: [{ role: "user", parts: [{ text: `Artículos del día (${dateStr}):\n\n${articleList}` }] }],
  });

  const text = res.text ?? "";
  if (!text.trim()) throw new Error("Briefing did not return any content");

  let parsed: {
    headline: string;
    summary: string;
    keyTakeaways: string;
    trends: string;
    highlighted: number[];
  };
  try {
    parsed = JSON.parse(text);
  } catch {
    // Defensa por si el modelo añade texto fuera del objeto: extrae el primer {...}.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Briefing did not return valid JSON");
    parsed = JSON.parse(jsonMatch[0]);
  }

  const articleIds = (parsed.highlighted || []).map((i) => recent[i - 1]?.id).filter(Boolean);

  const inserted = await db
    .insert(briefings)
    .values({
      date: dateStr,
      headline: parsed.headline,
      summary: parsed.summary,
      keyTakeaways: parsed.keyTakeaways,
      trends: parsed.trends ?? "",
      articleIds: JSON.stringify(articleIds),
    })
    .onConflictDoUpdate({
      target: briefings.date,
      set: {
        headline: parsed.headline,
        summary: parsed.summary,
        keyTakeaways: parsed.keyTakeaways,
        trends: parsed.trends ?? "",
        articleIds: JSON.stringify(articleIds),
      },
    })
    .returning({ id: briefings.id });

  return { id: inserted[0].id, date: dateStr };
}
