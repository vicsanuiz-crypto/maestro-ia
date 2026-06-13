# Maestro-IA

Tu tutor experto que se mantiene obsesivamente actualizado en IA y te enseña a dominar cada novedad como un profesional.

## Qué incluye

- **Briefing diario** — Claude Opus 4.7 resume las novedades del día desde 11 fuentes top.
- **Feed agregado** — Anthropic, OpenAI, DeepMind, HuggingFace, arXiv (cs.AI/CL/LG), Hacker News, MIT, The Verge, TechCrunch.
- **Chat con el Maestro** — streaming, con contexto del feed inyectado en cada conversación. Prompt caching activo.
- **Rutas de aprendizaje** — currículo progresivo (Fundamentos LLM → Prompt Engineering → Agentes → RAG → MCP).
- **Progreso por lección** — marca lo aprendido, sigue tu avance.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- SQLite + Drizzle ORM
- Anthropic SDK (`claude-opus-4-7`)
- rss-parser + Hacker News Algolia API

## Uso diario (1 clic)

Doble clic en **`start.cmd`**:
- Si el server ya está corriendo → abre el navegador directamente.
- Si no → construye (la primera vez), arranca el server en background y abre el navegador automáticamente.

Para detener: doble clic en **`stop.cmd`**.

### Crear acceso directo en el escritorio

1. Clic derecho en `start.cmd` → **Enviar a** → **Escritorio (crear acceso directo)**.
2. (Opcional) Renombra el acceso a "Maestro-IA".
3. (Opcional) Clic derecho en el acceso → **Propiedades** → **Cambiar icono** → elige uno.

### Auto-arranque al iniciar Windows (opcional)

1. `Win + R` → escribe `shell:startup` → Enter.
2. Copia el acceso directo de `start.cmd` ahí dentro.
3. Listo: cada vez que enciendas el PC, Maestro-IA arranca solo y se abre en tu navegador.

## Setup inicial (3 minutos, sólo la primera vez)

```bash
npm install

# crea tu .env.local
cp .env.example .env.local
# edita .env.local y pon tu ANTHROPIC_API_KEY

# crea la DB y siembra las rutas de aprendizaje
npm run db:push
npm run db:seed

# trae los primeros artículos
npm run ingest

# genera tu primer briefing (necesita API key)
npm run briefing

# arranca
npm run dev
```

Abre http://localhost:3000.

## Mantenerlo actualizado (cron)

### Opción A — Windows Task Scheduler

Crea una tarea que ejecute cada 6 horas:

```powershell
cd C:\Users\Asus\.claude\Proyectos\Maestro-IA
npm run ingest
```

Y otra diaria a las 8:00:

```powershell
npm run briefing
```

### Opción B — desde la propia app

Pulsa **"Refrescar feed"** en `/feed` cuando quieras actualizar manualmente.

### Opción C — endpoint HTTP (para Vercel Cron, etc.)

- `POST /api/ingest` — refresca feeds
- `POST /api/briefing` — genera briefing del día

## Estructura

```
src/
  app/
    page.tsx                # Dashboard
    briefing/               # Briefing diario
    feed/                   # Feed agregado
    chat/                   # Chat con Maestro
    learn/                  # Rutas de aprendizaje
    api/
      chat/route.ts         # Streaming Claude
      ingest/route.ts       # Refresca feeds
      briefing/route.ts     # Genera briefing
      progress/route.ts     # Marca lecciones
  db/
    schema.ts               # Drizzle schema
    index.ts                # DB client
  lib/
    claude.ts               # Anthropic client + system prompts
    ingest.ts               # RSS + HN ingester
    briefing.ts             # Daily briefing generator
    sources.ts              # Lista de fuentes
scripts/
  ingest.ts                 # CLI ingester
  generate-briefing.ts      # CLI briefing
  seed.ts                   # Seed learning paths
```

## Costes

- Briefing diario: ~1 llamada Opus, ~5K tokens entrada + 2K salida → ~$0.20/día.
- Chat: cacheado, ~$0.01-0.05 por mensaje según contexto.
- Ingest: gratis (RSS + APIs públicas).

**Total estimado uso personal: <$10/mes.**

## Cambiar el modelo de IA

Edita `.env.local` y cambia la línea `MAESTRO_MODEL=`. Reinicia con `stop.cmd` + `start.cmd`.

| Alias | Modelo | Cuándo usarlo |
|---|---|---|
| `opus-4-7` | Claude Opus 4.7 | Máxima calidad. Briefings ricos, razonamiento profundo. Más caro. |
| `sonnet-4-6` (por defecto) | Claude Sonnet 4.6 | Equilibrio calidad/coste. Recomendado para uso diario. |
| `haiku-4-5` | Claude Haiku 4.5 | Rapidez y coste mínimo. Para tareas masivas o conversaciones cortas. |

Para añadir un modelo nuevo cuando salga: edita `src/lib/claude.ts` y añade una entrada al objeto `MODELS`.

## Siguientes pasos

- [ ] Embeddings para búsqueda semántica en feed
- [ ] Notificaciones push del briefing
- [ ] Glosario vivo auto-generado
- [ ] Importar PDFs (papers) al feed
- [ ] Export a Notion / Obsidian
