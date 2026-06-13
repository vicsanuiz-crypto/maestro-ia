function renderInline(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let inList: "ul" | "ol" | null = null;

  const flushList = () => {
    if (inList) { out.push(`</${inList}>`); inList = null; }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        out.push(`<pre><code>${codeBuf.join("\n").replace(/</g, "&lt;")}</code></pre>`);
        codeBuf = []; inCode = false;
      } else { flushList(); inCode = true; }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    if (/^### /.test(line)) { flushList(); out.push(`<h3>${renderInline(line.slice(4))}</h3>`); continue; }
    if (/^## /.test(line)) { flushList(); out.push(`<h2>${renderInline(line.slice(3))}</h2>`); continue; }
    if (/^# /.test(line)) { flushList(); out.push(`<h1>${renderInline(line.slice(2))}</h1>`); continue; }
    if (/^> /.test(line)) { flushList(); out.push(`<blockquote>${renderInline(line.slice(2))}</blockquote>`); continue; }

    const ulMatch = line.match(/^[-*]\s+(.*)/);
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (ulMatch) {
      if (inList !== "ul") { flushList(); out.push("<ul>"); inList = "ul"; }
      out.push(`<li>${renderInline(ulMatch[1])}</li>`); continue;
    }
    if (olMatch) {
      if (inList !== "ol") { flushList(); out.push("<ol>"); inList = "ol"; }
      out.push(`<li>${renderInline(olMatch[1])}</li>`); continue;
    }

    flushList();
    if (line.trim()) out.push(`<p>${renderInline(line)}</p>`);
  }
  flushList();
  if (inCode) out.push(`<pre><code>${codeBuf.join("\n")}</code></pre>`);

  return <div className="prose-maestro" dangerouslySetInnerHTML={{ __html: out.join("\n") }} />;
}
