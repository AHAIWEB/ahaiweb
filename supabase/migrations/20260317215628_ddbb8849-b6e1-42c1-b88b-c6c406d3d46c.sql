
-- Remove the FK constraint on user_id so we can insert sample data
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
