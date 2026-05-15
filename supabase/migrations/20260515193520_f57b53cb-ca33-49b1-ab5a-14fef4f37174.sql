
CREATE TABLE public.historical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date text NOT NULL,
  year text,
  event text NOT NULL,
  category text NOT NULL DEFAULT 'event',
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_date, year, event)
);
ALTER TABLE public.historical_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read historical_events" ON public.historical_events FOR SELECT USING (true);
CREATE POLICY "Auth can manage historical_events" ON public.historical_events FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX idx_historical_events_date ON public.historical_events(event_date);

CREATE TABLE public.quotes_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text,
  source_name text,
  source_url text UNIQUE,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quotes_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quotes_pool" ON public.quotes_pool FOR SELECT USING (true);
CREATE POLICY "Auth can manage quotes_pool" ON public.quotes_pool FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
