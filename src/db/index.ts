import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// En producción (Vercel) usamos Turso: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
// En local, si no hay Turso configurado, caemos a un archivo SQLite local
// (el mismo maestro.db de siempre), vía el driver libSQL con prefijo file:.
function resolveUrl(): string {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  const local = process.env.DATABASE_URL || "maestro.db";
  // libSQL exige el esquema file: para archivos locales.
  return local.startsWith("file:") || local.startsWith("libsql:") ? local : `file:${local}`;
}

const client = createClient({
  url: resolveUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };
