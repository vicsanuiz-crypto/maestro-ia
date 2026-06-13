import { ingestAll } from "@/lib/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const results = await ingestAll();
  return Response.json({ ok: true, results });
}

export const GET = POST;
