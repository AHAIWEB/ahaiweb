
-- Add show_in_nav to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS show_in_nav boolean NOT NULL DEFAULT false;

-- Create daily_content table
CREATE TABLE public.daily_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  date date NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(content_type, date)
);

ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily_content" ON public.daily_content FOR SELECT TO public USING (true);
CREATE POLICY "Auth can manage daily_content" ON public.daily_content FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
