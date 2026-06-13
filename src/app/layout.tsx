import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Brain, Newspaper, MessageSquare, GraduationCap, Rss, Sparkles } from "lucide-react";
import { getActiveModelLabel } from "@/lib/claude";

export const metadata: Metadata = {
  title: "Maestro-IA — Domina la IA, nunca te quedes atrás",
  description: "Tu tutor experto que se mantiene actualizado en las novedades de IA y te enseña a dominarlas.",
};

const nav = [
  { href: "/", label: "Hoy", icon: Sparkles },
  { href: "/briefing", label: "Briefing diario", icon: Newspaper },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/chat", label: "Chat con Maestro", icon: MessageSquare },
  { href: "/learn", label: "Aprende", icon: GraduationCap },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen flex">
        <aside className="w-64 border-r border-border bg-card/30 flex flex-col p-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 mb-8 px-2 py-2">
            <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">Maestro-IA</div>
              <div className="text-[11px] text-muted-foreground">domina lo último en IA</div>
            </div>
          </Link>

          <nav className="flex flex-col gap-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto text-xs text-muted-foreground px-2 py-3 border-t border-border">
            <div className="font-medium text-foreground mb-1">Powered by Gemini</div>
            <div>{getActiveModelLabel()} + RSS en vivo</div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
