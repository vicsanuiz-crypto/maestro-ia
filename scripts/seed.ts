import "./_loadenv";
import { db } from "../src/db";
import { learningPaths, lessons } from "../src/db/schema";

const PATHS = [
  {
    slug: "fundamentos-llm",
    title: "Fundamentos de LLMs",
    description: "Cómo funcionan los modelos modernos: tokens, context windows, sampling, temperatura, y por qué importa.",
    level: "beginner",
    estimatedHours: 4,
    order: 1,
    lessons: [
      {
        slug: "que-es-un-llm",
        title: "Qué es realmente un LLM",
        objective: "Entender la arquitectura transformer a alto nivel y por qué los LLMs hacen lo que hacen.",
        content: `## La idea central

Un LLM (Large Language Model) es una red neuronal entrenada para predecir el **siguiente token** dada una secuencia de tokens previa. Suena simple, pero a escala suficiente emerge razonamiento, código, traducción y mucho más.

### Conceptos clave
- **Token**: unidad mínima de texto (subpalabra). "inteligencia" puede ser 3-4 tokens.
- **Context window**: cuántos tokens puede ver el modelo de una vez. Claude Opus 4.7 maneja **200K tokens**.
- **Parameters**: pesos entrenados (Claude Opus está en el orden de cientos de B).
- **Temperature**: aleatoriedad en sampling. 0 = determinista, 1 = creativo.

### Por qué importa
Si sabes cómo "ve" el modelo, escribes prompts mejores, gastas menos tokens y obtienes resultados más predecibles.`,
        exercises: `1. Abre el [tokenizer de Anthropic](https://docs.anthropic.com/) o tiktoken. Tokeniza la frase: "El maestro de IA enseña". ¿Cuántos tokens?
2. Repite con "AI master teaches". Compara. Conclusión sobre eficiencia en inglés vs español.
3. Pregúntale al Maestro: "Dame 3 trucos para que mis prompts usen menos tokens sin perder calidad."`,
        order: 1,
      },
      {
        slug: "sampling-temperatura",
        title: "Sampling, temperatura y top_p",
        objective: "Controlar la creatividad y determinismo del output.",
        content: `## Cómo el modelo elige cada token

En cada paso el modelo produce una distribución de probabilidad sobre todos los tokens posibles. Cómo elige influye en el resultado:

- **temperature = 0**: siempre el token más probable (determinista, ideal para extracción/clasificación)
- **temperature = 0.7**: balance (chat general)
- **temperature = 1+**: más diverso (escritura creativa)
- **top_p**: limita la elección a los tokens cuya probabilidad acumulada sume p (nucleus sampling)

### Regla práctica
- Tareas con respuesta correcta única → temperature 0
- Brainstorming / escritura → temperature 0.7-1.0
- Nunca combines temperature alta + top_p bajo (se cancelan)`,
        exercises: `1. Llama a la API con la misma pregunta, temperature 0 y temperature 1. Anota diferencias.
2. Pide al Maestro: "Dame 5 nombres para mi app de IA" con temperature 0 y luego con 1.`,
        order: 2,
      },
    ],
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering profesional",
    description: "De prompts básicos a few-shot, chain-of-thought, structured outputs y prompt caching.",
    level: "beginner",
    estimatedHours: 6,
    order: 2,
    lessons: [
      {
        slug: "estructura-prompt",
        title: "Anatomía de un prompt sólido",
        objective: "Construir prompts que funcionen consistentemente en producción.",
        content: `## El prompt profesional tiene 5 partes

1. **Rol / contexto**: "Eres un experto en X..."
2. **Tarea concreta**: "Tu trabajo es..."
3. **Constraints**: formato, longitud, qué evitar
4. **Ejemplos** (few-shot): 1-3 inputs/outputs
5. **Input real**: lo que quieres procesar

### Antipatrones
- "Sé creativo" — vago, no controla nada
- "Por favor" — no ayuda, no estorba, pero ocupa tokens
- Mezclar instrucciones e input sin separadores (\`<input>\`, \`---\`)
- Pedir formato JSON sin schema → resultado inconsistente

### Truco senior
Si pides JSON, da el **schema exacto** y un ejemplo válido. Reduce errores 10x.`,
        exercises: `1. Reescribe un prompt malo tuyo siguiendo la estructura de 5 partes.
2. Pídele al Maestro: "Audita este prompt y propón mejoras concretas: [pega tu prompt]"`,
        order: 1,
      },
      {
        slug: "prompt-caching",
        title: "Prompt caching (el truco que ahorra el 90%)",
        objective: "Reducir coste y latencia con cache_control en la API de Anthropic.",
        content: `## Qué es

La API de Anthropic permite marcar bloques de prompt como **cacheables**. La primera llamada los procesa normal; las siguientes reutilizan el cache y cobran ~10% del precio normal por esos tokens.

### Cuándo usarlo
- System prompts largos y estables
- Contexto RAG que cambia poco entre queries
- Documentos largos sobre los que haces múltiples preguntas

### Cómo
\`\`\`ts
await anthropic.messages.create({
  model: "claude-opus-4-7",
  system: [
    { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    { type: "text", text: largeContext, cache_control: { type: "ephemeral" } }
  ],
  messages: [...]
});
\`\`\`

### Mira el cache hit rate
La response trae \`usage.cache_read_input_tokens\` vs \`cache_creation_input_tokens\`. Si tu hit rate < 50%, algo está cambiando en el bloque cacheado.`,
        exercises: `1. Activa prompt caching en tu chat con Maestro-IA (ya lo hace) y observa la latencia del 2º mensaje vs el 1º.
2. Pregunta al Maestro: "Calcula el ahorro mensual si proceso 1M tokens con 70% cache hit rate."`,
        order: 2,
      },
    ],
  },
  {
    slug: "agentes-y-tools",
    title: "Agentes y Tool Use",
    description: "De prompts a agentes autónomos: tool use, loops de razonamiento, MCP y orquestación.",
    level: "intermediate",
    estimatedHours: 8,
    order: 3,
    lessons: [
      {
        slug: "tool-use-basico",
        title: "Tool use: dale manos al modelo",
        objective: "Conectar Claude a APIs y funciones externas.",
        content: `## El loop básico

1. Defines herramientas (functions) con schema JSON
2. Envías el prompt + la lista de herramientas
3. El modelo responde "quiero llamar a X con estos args"
4. Tú ejecutas la herramienta
5. Le devuelves el resultado
6. El modelo continúa razonando

### Ejemplo mínimo
\`\`\`ts
const tools = [{
  name: "get_weather",
  description: "Obtiene el clima de una ciudad",
  input_schema: {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"]
  }
}];

const res = await anthropic.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  tools,
  messages: [{ role: "user", content: "¿Qué tiempo hace en Las Palmas?" }]
});
\`\`\`

### Senior tip
No expongas al modelo herramientas peligrosas sin sandbox. \`exec\`, \`rm\`, escritura en producción → siempre con confirmación humana.`,
        exercises: `1. Define una tool \`search_feed(query)\` que busque en tu base de artículos.
2. Conviértelo en un agente que el usuario pueda preguntar y él decida si buscar o responder directo.`,
        order: 1,
      },
      {
        slug: "mcp-model-context-protocol",
        title: "MCP — la USB-C de la IA",
        objective: "Entender qué es Model Context Protocol y cómo te ahorra meses de integración.",
        content: `## Qué problema resuelve

Antes: cada agente tenía sus propias integraciones con Slack, Notion, GitHub... Cada cliente reimplementaba todo.

MCP define un **protocolo estándar** para que los modelos se conecten a herramientas y fuentes de datos. Un servidor MCP expone tools, resources y prompts. Cualquier cliente compatible (Claude Code, Claude Desktop, tu app) puede consumirlos sin código custom.

### Componentes
- **Server**: expone capacidades (Postgres, filesystem, GitHub, etc.)
- **Client**: el agente que consume
- **Transport**: stdio, HTTP, SSE

### Cuándo crear un MCP server propio
- Tu empresa tiene una API interna y quieres que cualquier agente IA la use
- Necesitas que múltiples clientes (Claude Desktop, tu app, Cursor) compartan integraciones`,
        exercises: `1. Instala el MCP de filesystem en Claude Desktop. Pídele que liste archivos de un directorio.
2. Pregunta al Maestro: "Dame un plan paso a paso para construir un MCP server que exponga mi DB Postgres."`,
        order: 2,
      },
    ],
  },
  {
    slug: "rag-produccion",
    title: "RAG en producción",
    description: "Retrieval Augmented Generation: embeddings, vector DBs, chunking, reranking y evaluación.",
    level: "intermediate",
    estimatedHours: 8,
    order: 4,
    lessons: [
      {
        slug: "que-es-rag",
        title: "RAG: cuándo y cuándo NO",
        objective: "Decidir si tu problema necesita RAG, fine-tuning o solo prompting.",
        content: `## La regla rápida

| Necesitas... | Usa |
|---|---|
| Conocimiento actualizado / dinámico | **RAG** |
| Estilo / formato muy específico | **Fine-tuning** |
| Tarea simple, contexto pequeño | **Solo prompting** |
| Conocimiento propietario que cambia poco | **RAG o fine-tuning** (suele ganar RAG) |

### Por qué RAG suele ganar
- Actualizable sin reentrenar
- Trazable (citas)
- Más barato a largo plazo
- Funciona con cualquier modelo base

### Cuándo NO usar RAG
- Si tu corpus < 50K tokens, mete todo en el contexto y olvídate
- Si necesitas que el modelo *internalice* un estilo, no que cite hechos`,
        exercises: `1. Decide: ¿tu app necesita RAG? Justifica con la tabla.
2. Pregunta al Maestro: "Audita este caso de uso y dime si RAG vale la pena: [describe tu caso]"`,
        order: 1,
      },
    ],
  },
  {
    slug: "mcp-avanzado",
    title: "MCP y orquestación avanzada",
    description: "Construye servidores MCP, agentes multi-herramienta y workflows complejos.",
    level: "advanced",
    estimatedHours: 10,
    order: 5,
    lessons: [
      {
        slug: "mcp-server-propio",
        title: "Tu primer MCP server en TypeScript",
        objective: "Construir y desplegar un servidor MCP funcional.",
        content: `## Setup mínimo

\`\`\`bash
npm init -y
npm i @modelcontextprotocol/sdk zod
\`\`\`

\`\`\`ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({ name: "mi-server", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{ name: "saluda", description: "Saluda a alguien", inputSchema: { type: "object", properties: { nombre: { type: "string" } } } }]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === "saluda") {
    return { content: [{ type: "text", text: \`Hola \${req.params.arguments?.nombre}!\` }] };
  }
  throw new Error("Tool desconocida");
});

const transport = new StdioServerTransport();
await server.connect(transport);
\`\`\`

Ahora conéctalo en Claude Desktop editando \`claude_desktop_config.json\`.`,
        exercises: `1. Ejecuta el ejemplo y verifica que Claude Desktop lo lista.
2. Añade una tool \`buscar_articulos(query)\` que use tu DB SQLite del Maestro-IA.`,
        order: 1,
      },
    ],
  },
];

(async () => {
  console.log("Seeding learning paths...");
  for (const p of PATHS) {
    const { lessons: pl, ...pathData } = p;
    const inserted = await db
      .insert(learningPaths)
      .values(pathData)
      .onConflictDoUpdate({ target: learningPaths.slug, set: pathData })
      .returning({ id: learningPaths.id });
    const pathId = inserted[0].id;

    for (const l of pl) {
      await db
        .insert(lessons)
        .values({ ...l, pathId })
        .onConflictDoNothing();
    }
    console.log(`  ${p.slug}: ${pl.length} lecciones`);
  }
  console.log("Done.");
})();
