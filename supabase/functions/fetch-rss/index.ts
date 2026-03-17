const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_FEEDS = [
  { name: 'প্রথম আলো', url: 'https://www.prothomalo.com/feed', category: 'দেশীয়' },
  { name: 'বিডি নিউজ', url: 'https://bangla.bdnews24.com/feed', category: 'দেশীয়' },
  { name: 'ডেইলি স্টার বাংলা', url: 'https://bangla.thedailystar.net/rss.xml', category: 'দেশীয়' },
  { name: 'BBC বাংলা', url: 'https://feeds.bbci.co.uk/bengali/rss.xml', category: 'আন্তর্জাতিক' },
  { name: 'DW বাংলা', url: 'https://rss.dw.com/xml/rss-bn-all', category: 'আন্তর্জাতিক' },
  { name: 'গ্রামীণ বাংলাদেশ', url: 'https://www.bd-pratidin.com/feed', category: 'গ্রামের খবর' },
];

function parseItems(xml: string, sourceName: string, category: string) {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || block.match(/<description>(.*?)<\/description>/)?.[1] || '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    const image = block.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ||
      block.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] ||
      block.match(/<img[^>]*src="([^"]+)"/)?.[1] || '';

    if (title) {
      items.push({
        title: title.replace(/<[^>]*>/g, '').trim(),
        link,
        description: desc.replace(/<[^>]*>/g, '').trim().substring(0, 200),
        pubDate,
        image,
        source: sourceName,
        category,
      });
    }
  }
  return items;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try to fetch feeds from database
    let feedUrls = DEFAULT_FEEDS;
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const res = await fetch(`${supabaseUrl}/rest/v1/rss_feeds?is_active=eq.true&select=name,url,category`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
      });
      if (res.ok) {
        const dbFeeds = await res.json();
        if (dbFeeds.length > 0) feedUrls = dbFeeds;
      }
    } catch { /* fallback to defaults */ }

    const results: any[] = [];

    const fetches = feedUrls.map(async (feed: any) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch(feed.url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'AHAiWEB-RSS/1.0' },
        });
        clearTimeout(timeout);
        const xml = await resp.text();
        return parseItems(xml, feed.name, feed.category || 'দেশীয়');
      } catch {
        console.log(`Failed to fetch ${feed.name}: ${feed.url}`);
        return [];
      }
    });

    const allResults = await Promise.all(fetches);
    allResults.forEach((items) => results.push(...items));

    results.sort((a, b) => {
      const da = new Date(a.pubDate).getTime() || 0;
      const db = new Date(b.pubDate).getTime() || 0;
      return db - da;
    });

    return new Response(
      JSON.stringify({ success: true, data: results, count: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('RSS error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
