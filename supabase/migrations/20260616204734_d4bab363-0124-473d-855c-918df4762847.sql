
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.dictionary_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  word_normalized text NOT NULL,
  language text NOT NULL DEFAULT 'bn',
  pronunciation text,
  part_of_speech text,
  meaning_bn text,
  meaning_en text,
  example text,
  synonyms text[],
  antonyms text[],
  source_url text,
  source_name text,
  extra jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(word_normalized, language, source_name)
);
CREATE INDEX idx_dict_word_norm ON public.dictionary_words USING gin (word_normalized gin_trgm_ops);
CREATE INDEX idx_dict_word ON public.dictionary_words (word);
GRANT SELECT ON public.dictionary_words TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dictionary_words TO authenticated;
GRANT ALL ON public.dictionary_words TO service_role;
ALTER TABLE public.dictionary_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dictionary" ON public.dictionary_words FOR SELECT USING (true);
CREATE POLICY "Auth manage dictionary" ON public.dictionary_words FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_dict_updated BEFORE UPDATE ON public.dictionary_words FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_favorite_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id uuid NOT NULL REFERENCES public.dictionary_words(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, word_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favorite_words TO authenticated;
GRANT ALL ON public.user_favorite_words TO service_role;
ALTER TABLE public.user_favorite_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own favorites" ON public.user_favorite_words FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text,
  description text,
  cover_url text,
  pdf_url text NOT NULL,
  file_size bigint,
  pages int,
  language text DEFAULT 'bn',
  category text,
  tags text[],
  is_public boolean NOT NULL DEFAULT false,
  download_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ebooks_public ON public.ebooks(is_public) WHERE is_public = true;
CREATE INDEX idx_ebooks_user ON public.ebooks(user_id);
GRANT SELECT ON public.ebooks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebooks TO authenticated;
GRANT ALL ON public.ebooks TO service_role;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public ebooks viewable" ON public.ebooks FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own ebooks" ON public.ebooks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_ebooks_updated BEFORE UPDATE ON public.ebooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
