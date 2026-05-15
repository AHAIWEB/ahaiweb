// Generic quote scraper - fetches each source URL, extracts <blockquote>/quoted patterns, upserts to quotes_pool
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function strip(s: string) { return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim(); }

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,*/*",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function extractQuotes(html: string, sourceUrl: string, sourceName: string) {
  const out: { text: string; author: string | null; source_name: string; source_url: string }[] = [];
  const seen = new Set<string>();

  // Strategy 1: <blockquote>...</blockquote>
  const bqRegex = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
  let m;
  while ((m = bqRegex.exec(html)) !== null) {
    const txt = strip(m[1]);
    if (txt.length > 12 && txt.length < 800 && !seen.has(txt)) {
      seen.add(txt);
      out.push({ text: txt, author: null, source_name: sourceName, source_url: `${sourceUrl}#q${out.length}` });
    }
  }

  // Strategy 2: paragraphs with quote characters
  if (out.length < 5) {
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((m = pRegex.exec(html)) !== null) {
      const txt = strip(m[1]);
      if (/[""\u201c\u201d"']/.test(txt) && txt.length > 25 && txt.length < 600 && !seen.has(txt)) {
        seen.add(txt);
        // try to split by — for author
        const dashSplit = txt.split(/\s+[—–-]\s+/);
        const text = dashSplit[0].replace(/^["""\u201c\u201d']|["""\u201c\u201d']$/g, "").trim();
        const author = dashSplit[1]?.trim() || null;
        if (text.length > 12) {
          out.push({ text, author, source_name: sourceName, source_url: `${sourceUrl}#q${out.length}` });
        }
      }
    }
  }

  // Strategy 3: list items
  if (out.length < 3) {
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    while ((m = liRegex.exec(html)) !== null) {
      const txt = strip(m[1]);
      if (txt.length > 25 && txt.length < 500 && !seen.has(txt)) {
        seen.add(txt);
        out.push({ text: txt, author: null, source_name: sourceName, source_url: `${sourceUrl}#q${out.length}` });
      }
    }
  }

  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const body = await req.json().catch(() => ({}));
    const sources: { url: string; name?: string }[] = body.sources || [];
    if (!sources.length) return new Response(JSON.stringify({ error: "sources[] required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    let inserted = 0;
    const log: any[] = [];

    for (const src of sources) {
      try {
        const html = await fetchHtml(src.url);
        const quotes = extractQuotes(html, src.url, src.name || new URL(src.url).hostname);
        if (!quotes.length) { log.push({ url: src.url, count: 0 }); continue; }

        const insRes = await fetch(`${supabaseUrl}/rest/v1/quotes_pool?on_conflict=source_url`, {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=ignore-duplicates,return=representation",
          },
          body: JSON.stringify(quotes),
        });
        if (insRes.ok) {
          const data = await insRes.json();
          inserted += data.length;
          log.push({ url: src.url, found: quotes.length, inserted: data.length });
        } else {
          log.push({ url: src.url, error: await insRes.text() });
        }
      } catch (e) {
        log.push({ url: src.url, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ inserted, log }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
