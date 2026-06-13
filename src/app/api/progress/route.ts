import { NextRequest } from "next/server";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { lessonId, status } = (await req.json()) as { lessonId: number; status: "completed" | "not_started" | "in_progress" };
  if (!lessonId || !status) return Response.json({ error: "lessonId and status required" }, { status: 400 });

  const existing = await db.select().from(progress).where(eq(progress.lessonId, lessonId)).limit(1);
  if (existing[0]) {
    await db
      .update(progress)
      .set({ status, completedAt: status === "completed" ? new Date() : null })
      .where(eq(progress.lessonId, lessonId));
  } else {
    await db.insert(progress).values({
      lessonId,
      status,
      completedAt: status === "completed" ? new Date() : null,
    });
  }
  return Response.json({ ok: true });
}
