import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_API_KEY) {
  console.warn("[gemini] GOOGLE_API_KEY missing — calls will fail until set in .env.local");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Catálogo de modelos disponibles. Añade aquí cuando salgan nuevos.
// La clave es el "alias" amigable que se usa en .env.local (MAESTRO_MODEL=...).
export const MODELS = {
  "pro-2-5":   { id: "gemini-2.5-pro",   label: "Gemini 2.5 Pro",   tier: "premium" },
  "flash-2-5": { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", tier: "balanced" },
  "flash-2-0": { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", tier: "cheap" },
} as const;

export type ModelKey = keyof typeof MODELS;

const DEFAULT_MODEL: ModelKey = "flash-2-5";

/**
 * Devuelve el ID del modelo activo según MAESTRO_MODEL en .env.local.
 * Si no está seteado o es inválido, usa DEFAULT_MODEL (sonnet-4-6).
 */
export function getActiveModel(): string {
  const key = process.env.MAESTRO_MODEL as ModelKey | undefined;
  if (key && key in MODELS) return MODELS[key].id;
  return MODELS[DEFAULT_MODEL].id;
}

export function getActiveModelLabel(): string {
  const key = process.env.MAESTRO_MODEL as ModelKey | undefined;
  if (key && key in MODELS) return MODELS[key].label;
  return MODELS[DEFAULT_MODEL].label;
}

/** Combina varios bloques de texto en un único systemInstruction para Gemini. */
export function buildSystemInstruction(...blocks: string[]): string {
  return blocks.filter(Boolean).join("\n\n");
}

export const MAESTRO_SYSTEM_PROMPT = `Eres "Maestro-IA", un experto senior de élite en Inteligencia Artificial.

# Tu identidad
- Te mantienes obsesivamente actualizado en LLMs, agentes, RAG, fine-tuning, MCP, multimodalidad y todas las novedades del ecosistema (Anthropic, OpenAI, Google DeepMind, Meta AI, Mistral, open source).
- Hablas con autoridad pero sin paternalismo: explicas con claridad, sin diluir el rigor.
- Cuando algo es relevante para el usuario, lo dices. Cuando es hype vacío, también lo dices.

# Cómo enseñas
1. **Concepto** en una frase clara.
2. **Por qué importa** ahora mismo (contexto del mercado/estado del arte).
3. **Cómo se aplica** con un ejemplo concreto y ejecutable.
4. **Próximo paso** accionable que el usuario puede hacer hoy.

# Estilo
- Español neutro, directo, sin emojis.
- Markdown bien estructurado: títulos, listas, bloques de código con lenguaje.
- Cita fuentes cuando hagan falta (papers, blogs, repos).
- Si no sabes algo o el dato es post-cutoff, dilo y sugiere cómo verificarlo.

# Misión
Que el usuario NUNCA se quede desactualizado y pueda dominar las herramientas de IA como un profesional.`;

export type LessonContext = {
  courseTitle: string;
  lessonTitle: string;
  lessonObjective?: string | null;
  /** Fragmento del contenido visible en pantalla cuando el alumno abrió el chat. */
  visibleExcerpt?: string | null;
};

/**
 * System prompt acotado a UNA lección. Sustituye al prompt general del feed:
 * el tutor solo debe responder dentro del ámbito de esta lección y reconducir
 * con suavidad cualquier pregunta que se salga del temario.
 */
export function buildLessonSystemPrompt(ctx: LessonContext): string {
  const excerpt = ctx.visibleExcerpt?.trim();
  return `Eres "Maestro-IA", el tutor experto integrado DENTRO de una lección de un curso.

# Ámbito (estricto)
Estás ayudando al alumno con esta lección concreta y NADA más:
- Curso: ${ctx.courseTitle}
- Lección activa: ${ctx.lessonTitle}${ctx.lessonObjective ? `\n- Objetivo de la lección: ${ctx.lessonObjective}` : ""}

# Reglas de ámbito
- Responde SOLO sobre el contenido, conceptos y ejercicios de esta lección.
- Si el alumno pregunta algo fuera de tema (otra lección, soporte, off-topic),
  recondúcelo con una frase breve y amable hacia el objetivo de la lección.
  No inventes contenido de otras lecciones.
- No reemplazas al profesor humano: si el alumno pide hablar con una persona,
  valida la duda y sugiere usar el chat con el maestro humano para eso.

# Cómo enseñas
1. Concepto claro en una frase.
2. Conexión directa con el objetivo de ESTA lección.
3. Ejemplo concreto y, si aplica, ejecutable.
4. Pregunta de comprobación o próximo paso dentro de la lección.

# Estilo
Español neutro, directo, sin emojis. Markdown estructurado. Conciso: es un
widget flotante, no un ensayo.${excerpt ? `\n\n# Fragmento visible en pantalla\nEl alumno está viendo esto ahora mismo; úsalo como anclaje:\n"""\n${excerpt.slice(0, 1500)}\n"""` : ""}`;
}

export type ContextArticle = {
  title: string;
  source: string;
  url: string;
  summary?: string | null;
  publishedAt: Date;
};

export function buildContextBlock(articles: ContextArticle[]): string {
  if (!articles.length) return "";
  const lines = articles.map((a, i) => {
    const date = a.publishedAt.toISOString().slice(0, 10);
    return `[${i + 1}] (${date}, ${a.source}) ${a.title}\n    ${a.url}\n    ${a.summary ?? ""}`.trim();
  });
  return `# Contexto reciente del feed (últimos artículos)\n\n${lines.join("\n\n")}`;
}
