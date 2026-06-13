// Lanzador para el preview de Claude Code.
// Claude Code inyecta una ANTHROPIC_API_KEY vacía en el entorno; Next.js
// (@next/env) no sobrescribe variables ya presentes en process.env, así que
// ignoraría la clave real de .env.local. La borramos antes de arrancar.
if (process.env.ANTHROPIC_API_KEY === "") delete process.env.ANTHROPIC_API_KEY;

const { spawn } = require("node:child_process");
const path = require("node:path");

const cwd = path.resolve(__dirname, "..");
const child = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "dev", "--", "--port", "3001"],
  { cwd, stdio: "inherit", env: process.env, shell: true }
);
child.on("exit", (code) => process.exit(code ?? 0));
