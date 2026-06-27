-- ============================================================
--  Everyday News Blog — Story Section Schema & Seed
--  Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- ─────────────────────────────────────────────
--  1. STORY ARTICLES TABLE
-- ─────────────────────────────────────────────
create table if not exists public.story_articles (
  id            bigserial primary key,
  title         text        not null,
  excerpt       text,
  body          text,
  image_url     text,
  author_name   text        default 'Staff Reporter',
  author_avatar text,
  author_role   text        default 'Writer',
  featured      boolean     default false,
  views_count   text        default '0',
  comments_count text       default '0',
  active        boolean     default true,
  created_at    timestamptz default now()
);

-- Enable Row-Level Security
alter table public.story_articles enable row level security;

-- Public read access
create policy "Story articles are public" on public.story_articles
  for select using (true);

-- Admin write access (ndukwovictor3@gmail.com)
create policy "Only admin can create story articles"
  on public.story_articles for insert
  with check (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

create policy "Only admin can update story articles"
  on public.story_articles for update
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

create policy "Only admin can delete story articles"
  on public.story_articles for delete
  using (auth.jwt() ->> 'email' = 'ndukwovictor3@gmail.com');

-- ─────────────────────────────────────────────
--  2. SEED DATA
-- ─────────────────────────────────────────────
insert into public.story_articles (title, excerpt, image_url, author_name, author_role, author_avatar, featured, views_count, comments_count, active) values
(
  'The Geopolitics of Resource Supply: The Modern Critical Mineral Rush',
  'As industrial nations accelerate manufacturing lines for lithium, cobalt, and rare earth elements, global supply chain networks undergo a complex geopolitical recalibration.',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=700&h=420&q=80',
  'Marcus Vance',
  'Diplomatic Correspondent',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
  true,
  '0',
  '0',
  true
),
(
  'Microgrid Initiatives Empower Remote Communities Across the Andes Cordillera',
  null,
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '14,250',
  '28',
  true
),
(
  'Urban Green Roof Canopies Linked to Substantial Mitigation of City Heat Islands',
  null,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '9,842',
  '15',
  true
),
(
  'Next-Generation High-Speed Rail Networks Expand Connectivity Across Southeast Asia',
  null,
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '18,910',
  '42',
  true
),
(
  'Clinical Breakthrough: AI Diagnostic Software Identifies Rare Illnesses in Minutes',
  null,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '22,115',
  '67',
  true
),
(
  'Maritime Advancements: Autonomous Zero-Emission Cargo Ships Finish Ocean Trials',
  null,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '11,390',
  '31',
  true
),
(
  'Biomimetic Skylines: How Modern Architects Learn from Termite Mounds',
  null,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '8,754',
  '19',
  true
),
(
  'Interactive E-Learning Portals Double Literacy Rates in Rural Developing Regions',
  null,
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '15,880',
  '50',
  true
),
(
  'Deep Sea Submersibles Map Strange Ecosystems Near Hydrothermal Ocean Vents',
  null,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '13,678',
  '22',
  true
),
(
  'Solid-State Battery Innovations Accelerate Global Renewable Transition Schedules',
  null,
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=120&h=90&q=80',
  'Staff Reporter',
  'Writer',
  null,
  false,
  '20,540',
  '81',
  true
);
