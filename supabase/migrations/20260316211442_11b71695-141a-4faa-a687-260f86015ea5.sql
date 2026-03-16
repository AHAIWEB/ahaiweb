
-- Tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Post-Tags junction
CREATE TABLE public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- Bangladesh location hierarchy
CREATE TABLE public.divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  bn_name TEXT NOT NULL
);

CREATE TABLE public.districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bn_name TEXT NOT NULL
);

CREATE TABLE public.upazilas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bn_name TEXT NOT NULL
);

CREATE TABLE public.unions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upazila_id UUID NOT NULL REFERENCES public.upazilas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bn_name TEXT NOT NULL
);

-- Post location mapping
CREATE TABLE public.post_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  division_id UUID REFERENCES public.divisions(id),
  district_id UUID REFERENCES public.districts(id),
  upazila_id UUID REFERENCES public.upazilas(id),
  union_id UUID REFERENCES public.unions(id)
);

-- Tag-Location mapping (tag can be associated with a location)
CREATE TABLE public.tag_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  division_id UUID REFERENCES public.divisions(id),
  district_id UUID REFERENCES public.districts(id),
  upazila_id UUID REFERENCES public.upazilas(id),
  union_id UUID REFERENCES public.unions(id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upazilas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_locations ENABLE ROW LEVEL SECURITY;

-- Public read for all
CREATE POLICY "Anyone can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Auth can manage tags" ON public.tags FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read post_tags" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Auth can manage post_tags" ON public.post_tags FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read divisions" ON public.divisions FOR SELECT USING (true);
CREATE POLICY "Auth can manage divisions" ON public.divisions FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Auth can manage districts" ON public.districts FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read upazilas" ON public.upazilas FOR SELECT USING (true);
CREATE POLICY "Auth can manage upazilas" ON public.upazilas FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read unions" ON public.unions FOR SELECT USING (true);
CREATE POLICY "Auth can manage unions" ON public.unions FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read post_locations" ON public.post_locations FOR SELECT USING (true);
CREATE POLICY "Auth can manage post_locations" ON public.post_locations FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read tag_locations" ON public.tag_locations FOR SELECT USING (true);
CREATE POLICY "Auth can manage tag_locations" ON public.tag_locations FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Seed Bangladesh divisions
INSERT INTO public.divisions (name, bn_name) VALUES
  ('Barishal', 'বরিশাল'),
  ('Chattogram', 'চট্টগ্রাম'),
  ('Dhaka', 'ঢাকা'),
  ('Khulna', 'খুলনা'),
  ('Mymensingh', 'ময়মনসিংহ'),
  ('Rajshahi', 'রাজশাহী'),
  ('Rangpur', 'রংপুর'),
  ('Sylhet', 'সিলেট');
