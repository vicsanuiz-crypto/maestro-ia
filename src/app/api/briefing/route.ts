import { generateDailyBriefing } from "@/lib/briefing";
import { guard } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Coste real (llama a Gemini): cooldown de 5 min para llamadas manuales.
const COOLDOWN_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  const blocked = await guard(req, "briefing", COOLDOWN_MS);
  if (blocked) return blocked;
  try {
    const result = await generateDailyBriefing();
    return Response.json({ ok: true, ...result });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export const GET = POST;
