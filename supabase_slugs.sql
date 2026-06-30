-- Create slugify function in Postgres
CREATE OR REPLACE FUNCTION slugify(value TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- convert to lowercase
  slug := lower(value);
  -- remove non-alphanumeric characters except spaces and hyphens
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  -- replace multiple spaces/dashes with a single dash
  slug := regexp_replace(slug, '[\s-]+', '-', 'g');
  -- trim dashes from start and end
  slug := regexp_replace(slug, '^-+|-+$', '', 'g');
  RETURN slug;
END;
$$ LANGUAGE plpgsql STRICT IMMUTABLE;

-- 1. Add slug column to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
UPDATE public.articles SET slug = slugify(title) WHERE slug IS NULL;

-- 2. Add slug column to editors_picks
ALTER TABLE public.editors_picks ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
UPDATE public.editors_picks SET slug = slugify(title) WHERE slug IS NULL;

-- 3. Add slug column to trending_articles
ALTER TABLE public.trending_articles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
UPDATE public.trending_articles SET slug = slugify(title) WHERE slug IS NULL;

-- 4. Add slug column to story_articles
ALTER TABLE public.story_articles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
UPDATE public.story_articles SET slug = slugify(title) WHERE slug IS NULL;
