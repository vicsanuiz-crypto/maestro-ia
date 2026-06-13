"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 480 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".5rem" }}>
            Error crítico
          </h1>
          <p style={{ color: "#a1a1aa", marginBottom: "1.5rem" }}>
            {error.message || "La aplicación encontró un error inesperado."}
          </p>
          <button
            onClick={reset}
            style={{
              padding: ".5rem 1rem",
              borderRadius: 6,
              border: "none",
              background: "#7c3aed",
              color: "#fff",
              fontSize: ".875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
