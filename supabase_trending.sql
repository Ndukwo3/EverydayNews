-- ============================================================
--  Everyday News Blog — Trending Articles Schema & Seed
--  Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- ─────────────────────────────────────────────
--  1. TRENDING ARTICLES TABLE
-- ─────────────────────────────────────────────
create table if not exists public.trending_articles (
  id           bigserial primary key,
  title        text        not null,
  excerpt      text,
  body         text,
  category     text,
  image_url    text,
  author_name  text        default 'Staff Reporter',
  author_avatar text,
  active       boolean     default true,
  created_at   timestamptz default now()
);

-- Enable Row-Level Security
alter table public.trending_articles enable row level security;

-- Public read access
create policy "Trending articles are public" on public.trending_articles
  for select using (true);

-- Admin write access (ndukwovictor3@gmail.com)
create policy "Only admin can create trending articles"
  on public.trending_articles for insert
  with check (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

create policy "Only admin can update trending articles"
  on public.trending_articles for update
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

create policy "Only admin can delete trending articles"
  on public.trending_articles for delete
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- ─────────────────────────────────────────────
--  2. SEED DATA
-- ─────────────────────────────────────────────
insert into public.trending_articles (title, excerpt, category, image_url, author_name, author_avatar, active) values
(
  'Fintech Evolution: Digital-Only Banking Platforms Capture Market Share',
  'Traditional retail banks face mounting pressure as frictionless fintech alternatives secure younger demographic users globally.',
  'FINANCE',
  'https://images.unsplash.com/photo-1554672408-730436b60dde?auto=format&fit=crop&w=400&h=250&q=80',
  'David Chen',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
  true
),
(
  'Reviving Forgotten Voices: AI Projects Map Endangered Indigenous Dialects',
  'Research teams deploy advanced neural linguistic models to document and preserve spoken dialects at risk of extinction in remote areas.',
  'CULTURE',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&h=250&q=80',
  'Elena Rostova',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  true
),
(
  'Culinary Renaissance: Modern Fermentation Merges Science with Gastronomy',
  'Renowned chefs partner with cellular biochemists to create sustainable, nutrient-rich flavors using modern fermentation vessels.',
  'CULTURE',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&h=250&q=80',
  'Chloe Dupont',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
  true
),
(
  'Geothermal Revolution: Deep-Crust Thermal Energy Tapped in Iceland',
  'Superdeep drilling operations extract high-temperature volcanic steam, setting a new benchmark for scalable geothermal energy production.',
  'EARTH',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=400&h=250&q=80',
  'Kristján Birgisson',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
  true
);
