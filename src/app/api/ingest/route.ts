import { ingestAll } from "@/lib/ingest";
import { guard } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ingesta de feeds (no usa Gemini, pero limitamos para evitar abuso): 2 min.
const COOLDOWN_MS = 2 * 60 * 1000;

export async function POST(req: Request) {
  const blocked = await guard(req, "ingest", COOLDOWN_MS);
  if (blocked) return blocked;
  const results = await ingestAll();
  return Response.json({ ok: true, results });
}

export const GET = POST;
