-- ============================================================
--  Everyday News — Analytics & Visits Logging Schema
--  Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- ─────────────────────────────────────────────
--  1. PAGE VISITS
-- ─────────────────────────────────────────────
create table if not exists public.page_visits (
  id           bigserial primary key,
  page_path    text not null,
  session_id   text not null,
  created_at   timestamptz default now()
);

alter table public.page_visits enable row level security;

-- Allow anyone to record their page visits
create policy "Anyone can log visits" on public.page_visits 
  for insert with check (true);

-- Allow public read for select metrics calculation
create policy "Public read visits" on public.page_visits 
  for select using (true);


-- ─────────────────────────────────────────────
--  2. SCRAPER RUNS LOG
-- ─────────────────────────────────────────────
create table if not exists public.scraper_runs (
  id             bigserial primary key,
  status         text not null default 'success', -- 'success' or 'error'
  articles_added integer not null default 0,
  error_message  text,
  created_at     timestamptz default now()
);

alter table public.scraper_runs enable row level security;

-- Allow scraper key to insert runs
create policy "Anyone can log scraper runs" on public.scraper_runs 
  for insert with check (true);

-- Allow public read for display in dashboard
create policy "Public read scraper runs" on public.scraper_runs 
  for select using (true);
