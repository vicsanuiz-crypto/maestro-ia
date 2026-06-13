import ChatClient from "./ChatClient";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-10 flex flex-col h-screen">
      <header className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
          <MessageSquare className="h-3 w-3" /> Chat con el Maestro
        </div>
        <h1 className="text-3xl font-bold">Pregunta lo que quieras dominar</h1>
        <p className="text-muted-foreground text-sm">
          El Maestro conoce las últimas novedades del feed y te enseña a aplicarlas.
        </p>
      </header>
      <ChatClient />
    </div>
  );
}
