"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function LessonComplete({ lessonId, done }: { lessonId: number; done: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState(done);

  function toggle() {
    setOptimistic((v) => !v);
    start(async () => {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, status: optimistic ? "not_started" : "completed" }),
      });
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        optimistic
          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
          : "bg-primary text-primary-foreground hover:opacity-90"
      }`}
    >
      <CheckCircle2 className="h-4 w-4" />
      {optimistic ? "Completada" : "Marcar como completada"}
    </button>
  );
}
