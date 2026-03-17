
-- Junction table for multiple categories per post
CREATE TABLE public.post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE(post_id, category_id)
);

ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read post_categories" ON public.post_categories FOR SELECT USING (true);
CREATE POLICY "Auth can manage post_categories" ON public.post_categories FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
