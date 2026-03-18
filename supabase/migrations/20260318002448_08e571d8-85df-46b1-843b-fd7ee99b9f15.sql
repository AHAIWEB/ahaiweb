
-- Add zone column to site_sections
ALTER TABLE public.site_sections ADD COLUMN IF NOT EXISTS zone text NOT NULL DEFAULT 'main';

-- Insert default left sidebar widgets (if not exist)
INSERT INTO public.site_sections (section_key, label, icon, sort_order, is_visible, zone, config)
VALUES
  ('today', 'আজকের দিন', '📅', 1, true, 'left_sidebar', '{}'),
  ('posts_recent_popular', 'পোস্ট (সাম্প্রতিক/জনপ্রিয়)', '📰', 2, true, 'left_sidebar', '{}'),
  ('left_labels', 'লেবেল', '🏷️', 3, true, 'left_sidebar', '{}')
ON CONFLICT DO NOTHING;

-- Insert default right sidebar widgets (if not exist)
INSERT INTO public.site_sections (section_key, label, icon, sort_order, is_visible, zone, config)
VALUES
  ('share', 'শেয়ার করুন', '🔗', 1, true, 'right_sidebar', '{}'),
  ('featured', 'ফিচার্ড', '⭐', 2, true, 'right_sidebar', '{}'),
  ('people', 'পিপল', '👤', 3, true, 'right_sidebar', '{}'),
  ('column', 'কলাম', '✒️', 4, true, 'right_sidebar', '{}'),
  ('location_map', 'লোকেশন ম্যাপ', '🗺️', 5, true, 'right_sidebar', '{}'),
  ('right_labels', 'লেবেল', '🏷️', 6, true, 'right_sidebar', '{}'),
  ('tag_cloud', 'ট্যাগ', '#️⃣', 7, true, 'right_sidebar', '{}')
ON CONFLICT DO NOTHING;
