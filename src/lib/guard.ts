import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * ¿La petición viene del cron de Vercel? Vercel añade automáticamente la
 * cabecera `Authorization: Bearer <CRON_SECRET>` a las invocaciones de cron
 * cuando existe la variable de entorno CRON_SECRET. Esas peticiones se saltan
 * el límite de frecuencia.
 */
export function isCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Aplica un cooldown por `key` usando la tabla rate_limits (compartida entre
 * instancias serverless). Devuelve un mensaje de error si todavía está en
 * cooldown, o null si se permite (y en ese caso registra el momento actual).
 */
export async function checkCooldown(key: string, cooldownMs: number): Promise<string | null> {
  const now = Date.now();
  const rows = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
  const last = rows[0]?.lastRun?.getTime() ?? 0;
  const elapsed = now - last;

  if (elapsed < cooldownMs) {
    const wait = Math.ceil((cooldownMs - elapsed) / 1000);
    return `Demasiadas solicitudes. Espera ${wait}s antes de volver a intentarlo.`;
  }

  await db
    .insert(rateLimits)
    .values({ key, lastRun: new Date() })
    .onConflictDoUpdate({ target: rateLimits.key, set: { lastRun: new Date() } });
  return null;
}

/**
 * Guard combinado para endpoints públicos costosos: el cron pasa siempre; el
 * resto queda sujeto a cooldown. Devuelve una Response 429 si está bloqueado,
 * o null si se permite continuar.
 */
export async function guard(req: Request, key: string, cooldownMs: number): Promise<Response | null> {
  if (isCronRequest(req)) return null;
  const blocked = await checkCooldown(key, cooldownMs);
  if (blocked) return Response.json({ ok: false, error: blocked }, { status: 429 });
  return null;
}
