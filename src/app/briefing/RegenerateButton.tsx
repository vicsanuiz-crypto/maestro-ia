"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RegenerateButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      // Primero refrescar feed (idempotente), luego regenerar briefing
      await fetch("/api/ingest", { method: "POST" });
      const res = await fetch("/api/briefing", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Falló");
      setMsg("Actualizado");
      router.refresh();
    } catch (e) {
      setMsg(`Error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
      title="Refresca el feed y regenera el briefing de hoy"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Regenerando..." : msg ?? "Regenerar briefing"}
    </button>
  );
}
