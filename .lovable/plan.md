
## লক্ষ্য
তিনটি ক্যাটাগরির জন্য বাল্ক স্ক্র্যাপার সিস্টেম + হোমপেজে "ইতিহাসে আজ" নতুন টাইমলাইন কার্ড + কার্ড মেকার।

---

## ১. Admin → Scraper Hub (`/admin/scrapers`)
নতুন একটি পেজ — তিনটি ট্যাব:

### (ক) পিপল স্ক্র্যাপার (Wikipedia Persons)
- Multi-URL টেক্সটএরিয়া — `👉` বা newline দিয়ে আলাদা URL
- "ফেচ ও সেভ" বাটন → edge function `scrape-wiki-person` কল
- প্রতিটি URL এর জন্য:
  - বাংলা Wikipedia পেজ ফেচ (REST API: `bn.wikipedia.org/api/rest_v1/page/html/{title}`)
  - Title, infobox image, সম্পূর্ণ HTML content extract
  - `posts` টেবিলে slug = wiki title এর ভিত্তিতে **upsert** (ডুপ্লিকেট চেক)
  - "পিপল" ক্যাটাগরিতে ট্যাগ
  - `source_url` সংরক্ষণ → পরে auto-sync এর জন্য
- প্রগ্রেস টোস্ট (X/Y সম্পন্ন)

### (খ) এই দিনে স্ক্র্যাপার
- একটি বাটন: "১২ মাসের সব ঘটনা ইম্পোর্ট"
- edge function `scrape-wiki-on-this-day` → বাংলা উইকির "ঐতিহাসিক বার্ষিকীর তালিকা" থেকে প্রতিটি মাস/তারিখের পেজ ফেচ
- নতুন টেবিল `historical_events` (date `MM-DD`, year, event, source_url) — UNIQUE constraint দিয়ে ডুপ্লিকেট চেক
- "এই দিনে" উইজেট এই টেবিল থেকে আজকের তারিখ ম্যাচ করে দেখাবে (Gemini fallback সহ)

### (গ) উক্তি স্ক্র্যাপার
- প্রিসেট সোর্স লিস্ট (bani.com.bd, quotes.gonevis.com, banglamsg.com ইত্যাদি) — চেকবক্স দিয়ে সিলেক্ট
- "সব ফেচ (পেজিনেশনসহ)" বাটন
- edge function `scrape-quotes` → প্রতিটি সোর্স থেকে fetch-url-meta এর মতো লজিকে কোট + author extract
- নতুন টেবিল `quotes` (text, author, source, source_url UNIQUE) — ডুপ্লিকেট চেক
- বিদ্যমান `daily_content` (quote) এই পুলে থেকে র‍্যান্ডম দেখাবে

---

## ২. হোমপেজে "ইতিহাসে আজ" টাইমলাইন কার্ড
`MainContent.tsx` এ বিদ্যমান on_this_day সেকশন রিডিজাইন:
- সিঙ্গেল কার্ড, gradient background + dot-pattern overlay + glow shadow
- বাঁ পাশে vertical dotted line, প্রতিটি ঘটনায় glow-dot
- প্রতিটি row: `[year badge] —— [event text]`
- নিচে "📇 কার্ড তৈরি করুন" বাটন → `/card-maker?events=<encoded>` route এ পাঠাবে

## ৩. Card Maker পেজ (`/card-maker`)
- query param থেকে events লোড
- ক্যানভাস স্টাইলে preview (gradient bg, ব্র্যান্ড লোগো, টাইটেল "এই দিনে — DD MMMM")
- `html-to-image` দিয়ে PNG ডাউনলোড বাটন

---

## টেকনিক্যাল ডিটেইল

### Database migration
```sql
-- historical_events
CREATE TABLE public.historical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date text NOT NULL,        -- 'MM-DD'
  year text,
  event text NOT NULL,
  category text DEFAULT 'event',   -- event/birth/death
  source_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_date, year, event)
);

-- quotes pool
CREATE TABLE public.quotes_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text,
  source_name text,
  source_url text UNIQUE,
  category text,
  created_at timestamptz DEFAULT now()
);
```
Both: public read, auth manage (RLS).

### Edge functions (নতুন)
- `scrape-wiki-person` — input: `{ urls: string[] }` → loop, fetch wiki HTML, upsert `posts`
- `scrape-wiki-on-this-day` — কোনো input নেই → ১২ মাস × ৩১ দিন পেজ ফেচ → bulk insert `historical_events`
- `scrape-quotes` — input: `{ sources: string[] }` → প্রতিটি সোর্স থেকে quote extract, upsert `quotes_pool`

### Auto-update (Wikipedia sync)
- pg_cron job → প্রতিদিন একবার `scrape-wiki-person` ট্রিগার করবে সব post যেখানে `source_url LIKE '%wikipedia.org%'`
- শুধু `content` ও `featured_image` আপডেট হবে, slug অপরিবর্তিত

### App routing (`App.tsx`)
- `/admin/scrapers` → নতুন `ScraperHub.tsx`
- `/card-maker` → নতুন `CardMaker.tsx`
- AdminLayout sidebar এ "🕷️ স্ক্র্যাপার" link

---

## Files to create/edit
**New:**
- `supabase/functions/scrape-wiki-person/index.ts`
- `supabase/functions/scrape-wiki-on-this-day/index.ts`
- `supabase/functions/scrape-quotes/index.ts`
- `src/pages/admin/ScraperHub.tsx`
- `src/pages/CardMaker.tsx`

**Edit:**
- `src/App.tsx` (routes)
- `src/components/AdminLayout.tsx` (nav link)
- `src/components/MainContent.tsx` (timeline redesign + card button, historical_events ফলব্যাক)
- `supabase/config.toml` (verify_jwt = false for new functions)

---

## স্কোপের বাইরে (এই plan এ নেই)
- Quote সাইটগুলোর প্রতিটি html structure-specific parser শুধু ১-২ pass এ। কিছু সাইট এ pagination/JS-render এর কারণে partial আসতে পারে — পরে iterate করা যাবে।
- Wikipedia infobox এর সম্পূর্ণ structured parsing (key-value table) — শুধু HTML hubohu render করবো।

Approve করলে migration দিয়ে শুরু করবো।
