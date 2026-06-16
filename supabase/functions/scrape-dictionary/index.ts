// Dictionary scraper — accepts URLs and extracts Bengali words/meanings
// Supports bangladict.net pattern and a generic fallback (definition lists, dt/dd)
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface ParsedWord {
  word: string;
  pronunciation?: string;
  part_of_speech?: string;
  meaning_bn?: string;
  meaning_en?: string;
  example?: string;
  synonyms?: string[];
  source_url: string;
  source_name: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseBangladict(html: string, url: string): ParsedWord[] {
  const results: ParsedWord[] = [];
  // bangladict.net pages: word lists like <a href=".../word/XXXX">শব্দ</a> with meaning blocks
  // Try common structure: entries inside <h2>WORD</h2> followed by meaning
  const entryRegex =
    /<h[2-4][^>]*>([^<]{1,80})<\/h[2-4]>[\s\S]{0,400}?(?:অর্থ|Meaning)[^:]*:?\s*([^<]{1,400})/gi;
  let m;
  while ((m = entryRegex.exec(html)) !== null) {
    const word = stripHtml(m[1]);
    const meaning = stripHtml(m[2]);
    if (word && meaning && word.length < 60) {
      results.push({
        word,
        meaning_bn: meaning,
        source_url: url,
        source_name: "bangladict.net",
      });
    }
  }
  return results;
}

function parseGeneric(html: string, url: string, sourceName: string): ParsedWord[] {
  const results: ParsedWord[] = [];

  // <dt>word</dt><dd>meaning</dd>
  const dlRegex = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  let m;
  while ((m = dlRegex.exec(html)) !== null) {
    const word = stripHtml(m[1]);
    const meaning = stripHtml(m[2]);
    if (word && meaning && word.length < 60) {
      results.push({ word, meaning_bn: meaning, source_url: url, source_name: sourceName });
    }
  }

  if (results.length === 0) {
    // table rows pattern
    const trRegex = /<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi;
    while ((m = trRegex.exec(html)) !== null) {
      const word = stripHtml(m[1]);
      const meaning = stripHtml(m[2]);
      if (word && meaning && word.length < 60 && word.length > 0) {
        results.push({ word, meaning_bn: meaning, source_url: url, source_name: sourceName });
      }
    }
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const urls: string[] = Array.isArray(body.urls)
      ? body.urls
      : (body.url ? [body.url] : []);
    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: "URLs required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let totalSaved = 0;
    const errors: string[] = [];
    const perUrl: Record<string, number> = {};

    for (const url of urls.slice(0, 50)) {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 AHAiWEB-Dictionary-Bot" },
        });
        if (!res.ok) {
          errors.push(`${url}: HTTP ${res.status}`);
          continue;
        }
        const html = await res.text();
        const host = new URL(url).hostname.replace("www.", "");
        let words: ParsedWord[] = [];
        if (host.includes("bangladict")) words = parseBangladict(html, url);
        if (words.length === 0) words = parseGeneric(html, url, host);

        for (const w of words.slice(0, 500)) {
          const { error } = await supabase
            .from("dictionary_words")
            .upsert(
              {
                word: w.word,
                word_normalized: normalize(w.word),
                language: "bn",
                meaning_bn: w.meaning_bn,
                meaning_en: w.meaning_en,
                pronunciation: w.pronunciation,
                part_of_speech: w.part_of_speech,
                example: w.example,
                synonyms: w.synonyms,
                source_url: w.source_url,
                source_name: w.source_name,
              },
              { onConflict: "word_normalized,language,source_name" },
            );
          if (!error) totalSaved++;
        }
        perUrl[url] = words.length;
      } catch (e) {
        errors.push(`${url}: ${(e as Error).message}`);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, total_saved: totalSaved, per_url: perUrl, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
