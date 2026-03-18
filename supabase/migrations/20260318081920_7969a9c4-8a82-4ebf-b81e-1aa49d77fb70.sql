
-- Insert video section if not exists
INSERT INTO public.site_sections (section_key, label, icon, sort_order, is_visible, zone, config)
SELECT 'video', 'ভিডিও', '🎬', 
  COALESCE((SELECT MAX(sort_order) FROM public.site_sections WHERE zone = 'main'), 0) + 1,
  true, 'main', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.site_sections WHERE section_key = 'video');

-- Also ensure unique constraint for daily_content upsert works
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_content_type_date_unique'
  ) THEN
    ALTER TABLE public.daily_content ADD CONSTRAINT daily_content_type_date_unique UNIQUE (content_type, date);
  END IF;
END $$;
