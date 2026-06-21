// Escalera de niveles del curso, de menor a mayor.
// Un único sitio para etiquetas (en español), orden, color e icono.
// Lo consumen el seed, la lista /learn y la página de lección.

export type Level = "dummies" | "beginner" | "intermediate" | "advanced";

export interface LevelMeta {
  /** Valor guardado en DB (learning_paths.level). */
  key: Level;
  /** Etiqueta visible para humanos. */
  label: string;
  /** Frase de una línea: para quién es este nivel. */
  tagline: string;
  /** Rango para ordenar (0 = más básico). */
  rank: number;
  /** Clases Tailwind para el badge. */
  badge: string;
  /** Emoji decorativo. */
  emoji: string;
}

export const LEVELS: Record<Level, LevelMeta> = {
  dummies: {
    key: "dummies",
    label: "Para Dummies",
    tagline: "Nunca has tocado la IA. Empezamos desde cero, sin tecnicismos.",
    rank: 0,
    badge: "bg-sky-500/15 text-sky-400",
    emoji: "🐣",
  },
  beginner: {
    key: "beginner",
    label: "Principiante",
    tagline: "Ya usas la IA y quieres entender cómo funciona por dentro.",
    rank: 1,
    badge: "bg-emerald-500/15 text-emerald-400",
    emoji: "🌱",
  },
  intermediate: {
    key: "intermediate",
    label: "Intermedio",
    tagline: "Construyes con la API: agentes, tools, RAG.",
    rank: 2,
    badge: "bg-amber-500/15 text-amber-400",
    emoji: "⚙️",
  },
  advanced: {
    key: "advanced",
    label: "Avanzado",
    tagline: "Orquestación, MCP propio y sistemas en producción.",
    rank: 3,
    badge: "bg-rose-500/15 text-rose-400",
    emoji: "🚀",
  },
};

/** Devuelve la metadata de un nivel, con fallback seguro para valores desconocidos. */
export function levelMeta(level: string): LevelMeta {
  return (
    LEVELS[level as Level] ?? {
      key: level as Level,
      label: level,
      tagline: "",
      rank: 99,
      badge: "bg-muted text-muted-foreground",
      emoji: "",
    }
  );
}

/** Niveles ordenados de Dummies a Avanzado. */
export const LEVELS_ORDERED: LevelMeta[] = Object.values(LEVELS).sort(
  (a, b) => a.rank - b.rank,
);
