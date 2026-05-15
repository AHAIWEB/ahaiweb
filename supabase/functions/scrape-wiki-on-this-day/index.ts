// Scrape Bangla Wikipedia "ঐতিহাসিক বার্ষিকীর তালিকা" - 12 months pages, extract events per date
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const months = [
  ["জানুয়ারি", 31, "01"], ["ফেব্রুয়ারি", 29, "02"], ["মার্চ", 31, "03"],
  ["এপ্রিল", 30, "04"], ["মে", 31, "05"], ["জুন", 30, "06"],
  ["জুলাই", 31, "07"], ["আগস্ট", 31, "08"], ["সেপ্টেম্বর", 30, "09"],
  ["অক্টোবর", 31, "10"], ["নভেম্বর", 30, "11"], ["ডিসেম্বর", 31, "12"],
] as const;

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function bn(n: number) { return String(n).split("").map((d) => bnDigits[+d] || d).join(""); }

function stripTags(s: string) { return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }

async function fetchMonthDay(monthName: string, day: number) {
  const title = `${day}_${monthName}`;
  const enc = encodeURIComponent(title);
  const url = `https://bn.wikipedia.org/api/rest_v1/page/html/${enc}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const html = await res.text();

  // Find sections: ঘটনাবলী, জন্ম, মৃত্যু
  const sections: Record<string, string> = {};
  const sectionRegex = /<section[^>]*>([\s\S]*?)<\/section>/gi;
  let m;
  while ((m = sectionRegex.exec(html)) !== null) {
    const sec = m[1];
    const headMatch = sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (!headMatch) continue;
    const head = stripTags(headMatch[1]);
    if (head.includes("ঘটনা")) sections.event = sec;
    else if (head.includes("জন্ম")) sections.birth = sec;
    else if (head.includes("মৃত্যু")) sections.death = sec;
  }

  const events: { year: string; event: string; category: string }[] = [];
  for (const [cat, sec] of Object.entries(sections)) {
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let li;
    while ((li = liRegex.exec(sec)) !== null) {
      const text = stripTags(li[1]);
      if (!text || text.length < 6) continue;
      const yearMatch = text.match(/^([০-৯0-9]{3,4})\s*[-—–:।\s]/);
      const year = yearMatch ? yearMatch[1] : "";
      const eventTxt = year ? text.slice(yearMatch![0].length).trim() : text;
      if (eventTxt.length < 4) continue;
      events.push({ year, event: eventTxt.slice(0, 500), category: cat });
    }
  }
  return events;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const body = await req.json().catch(() => ({}));
    const limitMonths: number[] | undefined = body.months; // optional 1-12 list
    const onlyToday: boolean = !!body.onlyToday;

    let totalInserted = 0;
    let totalSkipped = 0;
    const log: string[] = [];

    const monthsToRun = onlyToday
      ? (() => {
          const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
          return [now.getMonth() + 1];
        })()
      : (limitMonths && limitMonths.length ? limitMonths : months.map((_, i) => i + 1));

    for (const mIdx of monthsToRun) {
      const [mName, mDays, mNum] = months[mIdx - 1];
      const daysToRun = onlyToday
        ? [new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })).getDate()]
        : Array.from({ length: mDays }, (_, i) => i + 1);

      for (const day of daysToRun) {
        try {
          const events = await fetchMonthDay(mName, day);
          if (!events || !events.length) { log.push(`${mName} ${day}: 0`); continue; }

          const eventDate = `${mNum}-${String(day).padStart(2, "0")}`;
          const rows = events.map((e) => ({
            event_date: eventDate,
            year: e.year || null,
            event: e.event,
            category: e.category,
            source_url: `https://bn.wikipedia.org/wiki/${day}_${mName}`,
          }));

          // Upsert with ON CONFLICT DO NOTHING - use Prefer:resolution=ignore-duplicates
          const insRes = await fetch(`${supabaseUrl}/rest/v1/historical_events?on_conflict=event_date,year,event`, {
            method: "POST",
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
              Prefer: "resolution=ignore-duplicates,return=representation",
            },
            body: JSON.stringify(rows),
          });
          if (insRes.ok) {
            const inserted = await insRes.json();
            totalInserted += inserted.length;
            totalSkipped += rows.length - inserted.length;
            log.push(`${mName} ${day}: +${inserted.length}/${rows.length}`);
          } else {
            log.push(`${mName} ${day}: ERR ${await insRes.text()}`);
          }
        } catch (e) {
          log.push(`${mName} ${day}: EX ${(e as Error).message}`);
        }
      }
    }

    return new Response(JSON.stringify({ inserted: totalInserted, skipped: totalSkipped, log }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
