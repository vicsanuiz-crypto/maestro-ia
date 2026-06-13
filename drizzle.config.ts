import type { Config } from "drizzle-kit";
import { config } from "dotenv";
import { existsSync } from "node:fs";

// Carga .env.local (o .env) para que db:push tenga las credenciales de Turso.
for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) { config({ path: f, override: true }); break; }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Si hay Turso configurado, push contra Turso (producción).
// Si no, push contra el archivo SQLite local.
export default (url
  ? {
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "turso",
      dbCredentials: { url, authToken },
    }
  : {
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: { url: process.env.DATABASE_URL || "maestro.db" },
    }) satisfies Config;
