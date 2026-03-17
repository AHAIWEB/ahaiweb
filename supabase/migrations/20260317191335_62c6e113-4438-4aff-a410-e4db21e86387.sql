
-- RSS feeds table for admin management
CREATE TABLE public.rss_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'দেশীয়',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rss_feeds" ON public.rss_feeds FOR SELECT USING (true);
CREATE POLICY "Auth can manage rss_feeds" ON public.rss_feeds FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Seed default feeds
INSERT INTO public.rss_feeds (name, url, category) VALUES
  ('প্রথম আলো', 'https://www.prothomalo.com/feed', 'দেশীয়'),
  ('বিডি নিউজ', 'https://bangla.bdnews24.com/feed', 'দেশীয়'),
  ('ডেইলি স্টার বাংলা', 'https://bangla.thedailystar.net/rss.xml', 'দেশীয়'),
  ('BBC বাংলা', 'https://feeds.bbci.co.uk/bengali/rss.xml', 'আন্তর্জাতিক'),
  ('DW বাংলা', 'https://rss.dw.com/xml/rss-bn-all', 'আন্তর্জাতিক'),
  ('গ্রামীণ বাংলাদেশ', 'https://www.bd-pratidin.com/feed', 'গ্রামের খবর'),
  ('বাংলানিউজ২৪', 'https://www.banglanews24.com/rss/rss.xml', 'গ্রামের খবর'),
  ('জাগো নিউজ', 'https://www.jagonews24.com/rss/rss.xml', 'গ্রামের খবর');
