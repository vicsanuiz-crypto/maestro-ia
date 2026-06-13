import Parser from "rss-parser";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { SOURCES, type FeedSource } from "./sources";
import { eq } from "drizzle-orm";

const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "Maestro-IA/1.0" } });

type Item = {
  source: string;
  sourceType: string;
  title: string;
  url: string;
  author?: string | null;
  publishedAt: Date;
  rawContent?: string | null;
  category: string;
};

async function fetchRss(s: FeedSource): Promise<Item[]> {
  const feed = await parser.parseURL(s.url);
  return (feed.items || []).slice(0, 20).map((it) => ({
    source: s.name,
    sourceType: s.type,
    title: (it.title ?? "Untitled").trim(),
    url: it.link ?? "",
    author: it.creator ?? it.author ?? null,
    publishedAt: it.isoDate ? new Date(it.isoDate) : new Date(),
    rawContent: (it.contentSnippet ?? it.content ?? "").toString().slice(0, 4000),
    category: s.category,
  })).filter((x) => x.url);
}

async function fetchHN(s: FeedSource): Promise<Item[]> {
  const res = await fetch(s.url, { headers: { "User-Agent": "Maestro-IA/1.0" } });
  if (!res.ok) return [];
  const json = (await res.json()) as { hits: Array<{ title?: string; url?: string; objectID: string; author?: string; created_at: string; points?: number }> };
  return json.hits
    .filter((h) => h.url && h.title)
    .slice(0, 15)
    .map((h) => ({
      source: s.name,
      sourceType: s.type,
      title: `${h.title!} (${h.points ?? 0} pts)`,
      url: h.url!,
      author: h.author ?? null,
      publishedAt: new Date(h.created_at),
      rawContent: null,
      category: s.category,
    }));
}

export async function ingestSource(s: FeedSource): Promise<number> {
  try {
    const items = s.type === "hn" ? await fetchHN(s) : await fetchRss(s);
    let added = 0;
    for (const it of items) {
      const exists = await db.select({ id: articles.id }).from(articles).where(eq(articles.url, it.url)).limit(1);
      if (exists.length) continue;
      await db.insert(articles).values({
        source: it.source,
        sourceType: it.sourceType,
        title: it.title,
        url: it.url,
        author: it.author ?? null,
        publishedAt: it.publishedAt,
        rawContent: it.rawContent ?? null,
        category: it.category,
      });
      added++;
    }
    return added;
  } catch (e) {
    console.error(`[ingest] ${s.name} failed:`, (e as Error).message);
    return 0;
  }
}

export async function ingestAll(): Promise<{ source: string; added: number }[]> {
  const results = await Promise.all(SOURCES.map(async (s) => ({ source: s.name, added: await ingestSource(s) })));
  return results;
}
