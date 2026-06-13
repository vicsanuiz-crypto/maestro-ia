import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-20 text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
        <Compass className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
      <p className="text-muted-foreground mb-6">
        La ruta que buscas no existe o se ha movido.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>
    </div>
  );
}
