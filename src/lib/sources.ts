export type FeedSource = {
  id: string;
  name: string;
  type: "rss" | "atom" | "arxiv" | "hn";
  url: string;
  category: "lab" | "research" | "news" | "community" | "tools";
};

export const SOURCES: FeedSource[] = [
  { id: "anthropic", name: "Anthropic News", type: "rss", url: "https://rsshub.app/anthropic/news", category: "lab" },
  { id: "openai", name: "OpenAI Blog", type: "rss", url: "https://openai.com/news/rss.xml", category: "lab" },
  { id: "deepmind", name: "Google DeepMind", type: "rss", url: "https://deepmind.google/blog/rss.xml", category: "lab" },
  { id: "huggingface", name: "Hugging Face Blog", type: "rss", url: "https://huggingface.co/blog/feed.xml", category: "tools" },
  { id: "mit-ai", name: "MIT News — AI", type: "rss", url: "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml", category: "news" },
  { id: "verge-ai", name: "The Verge — AI", type: "rss", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", category: "news" },
  { id: "techcrunch-ai", name: "TechCrunch — AI", type: "rss", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "news" },
  { id: "arxiv-cs-ai", name: "arXiv cs.AI", type: "arxiv", url: "http://export.arxiv.org/rss/cs.AI", category: "research" },
  { id: "arxiv-cs-cl", name: "arXiv cs.CL", type: "arxiv", url: "http://export.arxiv.org/rss/cs.CL", category: "research" },
  { id: "arxiv-cs-lg", name: "arXiv cs.LG", type: "arxiv", url: "http://export.arxiv.org/rss/cs.LG", category: "research" },
  { id: "hn-ai", name: "Hacker News — AI", type: "hn", url: "https://hn.algolia.com/api/v1/search?tags=story&query=AI&numericFilters=points%3E80", category: "community" },
];
