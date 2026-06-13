import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const candidates = [".env.local", ".env"];
for (const f of candidates) {
  const p = resolve(process.cwd(), f);
  if (existsSync(p)) {
    config({ path: p, override: true });
    break;
  }
}
