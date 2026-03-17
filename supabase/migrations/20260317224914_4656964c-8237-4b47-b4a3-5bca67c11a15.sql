CREATE TABLE public.site_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_sections" ON public.site_sections FOR SELECT TO public USING (true);
CREATE POLICY "Auth can manage site_sections" ON public.site_sections FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Seed default sections
INSERT INTO site_sections (section_key, label, icon, sort_order, is_visible, config) VALUES
('news', 'সংবাদ (লাইভ)', '📰', 1, true, '{"tabs": ["দেশীয়", "আন্তর্জাতিক", "গ্রামের খবর"]}'),
('camera', 'আমার ক্যামেরা', '📸', 2, true, '{}'),
('travel', 'ভ্রমণ', '✈️', 3, true, '{}'),
('writing', 'লেখালেখি', '✍️', 4, true, '{}'),
('family', 'ফ্যামিলি', '👨‍👩‍👧‍👦', 5, true, '{}'),
('url-posts', 'শেয়ার করা লিংক', '🔗', 6, true, '{}'),
('ad-slot-1', 'বিজ্ঞাপন স্লট ১', '📢', 7, false, '{"type": "ad", "ad_code": ""}'),
('ad-slot-2', 'বিজ্ঞাপন স্লট ২', '📢', 8, false, '{"type": "ad", "ad_code": ""}');