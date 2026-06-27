-- ============================================================
--  Everyday News Blog — Admin RLS Policies
--  Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- Drop old policies if they exist
drop policy if exists "Authenticated users can create articles" on public.articles;
drop policy if exists "Authenticated users can update articles" on public.articles;
drop policy if exists "Authenticated users can delete articles" on public.articles;
drop policy if exists "Authenticated users can create flash news" on public.flash_news;
drop policy if exists "Authenticated users can update flash news" on public.flash_news;
drop policy if exists "Authenticated users can delete flash news" on public.flash_news;

drop policy if exists "Only admin can create articles" on public.articles;
drop policy if exists "Only admin can update articles" on public.articles;
drop policy if exists "Only admin can delete articles" on public.articles;
drop policy if exists "Only admin can create flash news" on public.flash_news;
drop policy if exists "Only admin can update flash news" on public.flash_news;
drop policy if exists "Only admin can delete flash news" on public.flash_news;

-- Create restricted policies for ndukwovictor3@gmail.com
-- Allow only the admin to INSERT articles
create policy "Only admin can create articles"
  on public.articles for insert
  with check (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- Allow only the admin to UPDATE articles
create policy "Only admin can update articles"
  on public.articles for update
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- Allow only the admin to DELETE articles
create policy "Only admin can delete articles"
  on public.articles for delete
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- Allow only the admin to INSERT flash news
create policy "Only admin can create flash news"
  on public.flash_news for insert
  with check (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- Allow only the admin to UPDATE flash news
create policy "Only admin can update flash news"
  on public.flash_news for update
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- Allow only the admin to DELETE flash news
create policy "Only admin can delete flash news"
  on public.flash_news for delete
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- ─────────────────────────────────────────────
--  COMMENT SYSTEM UPGRADES (Replies, Likes, and RLS)
-- ─────────────────────────────────────────────

-- Add parent_id column for threaded comment replies
alter table public.comments 
  add column if not exists parent_id bigint references public.comments(id) on delete cascade;

-- Add likes_count column for liking comments
alter table public.comments 
  add column if not exists likes_count int default 0;

-- Drop old update policy if it exists
drop policy if exists "Anyone can update comments" on public.comments;

-- Allow anyone to update comments (necessary to increment/decrement likes_count)
create policy "Anyone can update comments" 
  on public.comments for update using (true);
