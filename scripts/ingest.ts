import "./_loadenv";
import { ingestAll } from "../src/lib/ingest";

(async () => {
  console.log("Ingesting feeds...");
  const results = await ingestAll();
  for (const r of results) console.log(`  ${r.source}: +${r.added}`);
  const total = results.reduce((s, r) => s + r.added, 0);
  console.log(`Done. ${total} new articles.`);
})();
