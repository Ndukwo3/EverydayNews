-- ============================================================
--  Everyday News Blog — Editor's Pick Schema & Seed
--  Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- ─────────────────────────────────────────────
--  1. EDITOR'S PICKS TABLE
-- ─────────────────────────────────────────────
create table if not exists public.editors_picks (
  id           bigserial primary key,
  title        text        not null,
  excerpt      text,
  body         text,
  category     text,
  image_url    text,
  author_name  text        default 'Staff Reporter',
  author_avatar text,
  featured     boolean     default false,
  active       boolean     default true,
  created_at   timestamptz default now()
);

-- Enable Row-Level Security
alter table public.editors_picks enable row level security;

-- Public read access
create policy "Editor's picks are public" on public.editors_picks
  for select using (true);

-- Admin write access (ndukwovictor3@gmail.com)
create policy "Only admin can create editor's picks"
  on public.editors_picks for insert
  with check (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

create policy "Only admin can update editor's picks"
  on public.editors_picks for update
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

create policy "Only admin can delete editor's picks"
  on public.editors_picks for delete
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- ─────────────────────────────────────────────
--  2. SEED DATA
-- ─────────────────────────────────────────────
insert into public.editors_picks (title, category, image_url, author_name, author_avatar, featured, active) values
(
  'The Art of Slow Travel: Exploring Remote Coastal Villages of Northern Europe',
  'TRAVEL',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=400&h=250&q=80',
  'Lukas Berg',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80',
  false,
  true
),
(
  'Championship Season: Record-Breaking Athletics Kick Off in Rome Stadium',
  'SPORT',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&h=250&q=80',
  'Guiseppe Rossi',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80',
  false,
  true
),
(
  'Symphony of Light: Immersive Digital Galleries Capture Global Audiences',
  'CULTURE',
  'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&h=400&q=80',
  'Chloe Dupont',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  true,
  true
),
(
  'Financial Strategy: Central Banks Coordinate Initiatives to Stable Markets',
  'FINANCE',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&h=250&q=80',
  'Sarah Jenkins',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
  false,
  true
),
(
  'Renewable Synergy: Solar Power Meets Pumped Hydro Storage in the Alps',
  'EARTH',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=250&q=80',
  'Hans Muller',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
  false,
  true
);
