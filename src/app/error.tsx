"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-8 py-20 text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 text-red-500 mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Algo ha fallado</h1>
      <p className="text-muted-foreground mb-6">
        {error.message || "Se produjo un error inesperado al cargar esta sección."}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
      >
        <RotateCw className="h-4 w-4" /> Reintentar
      </button>
    </div>
  );
}
