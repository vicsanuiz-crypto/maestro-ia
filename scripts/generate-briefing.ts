import "./_loadenv";
import { generateDailyBriefing } from "../src/lib/briefing";

(async () => {
  console.log("Generating daily briefing...");
  try {
    const r = await generateDailyBriefing();
    console.log(`Briefing created/updated: id=${r.id} date=${r.date}`);
  } catch (e) {
    console.error("Failed:", (e as Error).message);
    process.exit(1);
  }
})();
