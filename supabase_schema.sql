-- ============================================================
--  Everyday News Blog — Supabase Database Schema
--  Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- ─────────────────────────────────────────────
--  1. ARTICLES
-- ─────────────────────────────────────────────
create table if not exists public.articles (
  id           bigserial primary key,
  title        text        not null,
  excerpt      text,
  body         text,
  category     text,
  image_url    text,
  author_name  text        default 'Staff Reporter',
  author_avatar text,
  author_bio   text,
  featured     boolean     default false,
  created_at   timestamptz default now()
);

-- Enable Row-Level Security (read publicly, write only via service key)
alter table public.articles enable row level security;
create policy "Articles are public" on public.articles
  for select using (true);

-- ─────────────────────────────────────────────
--  2. COMMENTS
-- ─────────────────────────────────────────────
create table if not exists public.comments (
  id          bigserial primary key,
  article_id  bigint      not null references public.articles(id) on delete cascade,
  author      text        not null default 'Anonymous User',
  avatar      text,
  text        text        not null,
  created_at  timestamptz default now()
);

alter table public.comments enable row level security;

-- Anyone can read comments
create policy "Comments are public" on public.comments
  for select using (true);

-- Anyone can insert a comment (anon key)
create policy "Anyone can post a comment" on public.comments
  for insert with check (true);

-- ─────────────────────────────────────────────
--  3. LIKES
-- ─────────────────────────────────────────────
create table if not exists public.likes (
  id          bigserial primary key,
  article_id  bigint      not null references public.articles(id) on delete cascade,
  session_id  text        not null,
  created_at  timestamptz default now(),
  unique(article_id, session_id)   -- one like per browser session per article
);

alter table public.likes enable row level security;

create policy "Likes are public" on public.likes
  for select using (true);

create policy "Anyone can like" on public.likes
  for insert with check (true);

create policy "Own session can remove like" on public.likes
  for delete using (true);

-- ─────────────────────────────────────────────
--  4. FLASH NEWS
-- ─────────────────────────────────────────────
create table if not exists public.flash_news (
  id          bigserial primary key,
  text        text        not null,
  active      boolean     default true,
  created_at  timestamptz default now()
);

alter table public.flash_news enable row level security;

create policy "Flash news is public" on public.flash_news
  for select using (true);

-- ─────────────────────────────────────────────
--  5. SEED DATA — Articles
-- ─────────────────────────────────────────────
insert into public.articles (title, excerpt, body, category, image_url, author_name, author_avatar, author_bio, featured) values
(
  'Global Markets Rally as Technology Sector Hits Record Highs',
  'Stock markets around the world surged on Friday as the technology sector led gains, with major indices reaching all-time highs amid strong earnings reports and positive economic data.',
  'Global equities hit fresh records on Friday, driven by a strong earnings season from the world''s largest technology companies. The S&P 500 climbed 1.8%, the Nasdaq Composite surged 2.4%, and the Dow Jones Industrial Average added nearly 400 points.

Investors were encouraged by a string of better-than-expected quarterly results from mega-cap tech firms, as well as easing concerns about inflation and interest rates. The Federal Reserve''s latest meeting minutes suggested a more cautious approach to future rate hikes, boosting risk appetite across markets.

"The fundamentals remain strong," said Sarah Chen, chief investment strategist at Pacific Capital. "Earnings growth is back on track, and with AI-driven productivity gains being priced in, investors see a long runway ahead."

Energy and financial stocks also participated in the rally, indicating broad market participation rather than a narrow tech-only move. European and Asian markets closed higher earlier in the session, setting a positive tone for Wall Street.

Looking ahead, analysts expect continued volatility but maintain an overall bullish outlook, particularly for companies with strong exposure to artificial intelligence and cloud computing.',
  'FINANCE',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&h=480&q=80',
  'Michael Torres',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
  'Senior financial correspondent with 12 years of experience covering global markets and macroeconomics.',
  true
),
(
  'NASA James Webb Telescope Captures Unprecedented Black Hole Details',
  'The James Webb Space Telescope has delivered its most detailed images yet of a supermassive black hole, offering scientists new insights into the nature of these cosmic giants.',
  'Scientists at NASA unveiled a stunning new set of images this week from the James Webb Space Telescope, showing the most detailed view ever captured of a supermassive black hole at the center of a distant galaxy.

The observations, published in the journal Nature Astronomy, reveal intricate structures in the black hole''s accretion disk and jets of material being expelled at nearly the speed of light. Astronomers say these details were previously invisible even to the most powerful ground-based telescopes.

"What we''re seeing is truly extraordinary," said Dr. Amelia Park, lead researcher at the Space Telescope Science Institute. "Webb is allowing us to peer into regions of the universe that were completely hidden from us just a decade ago."

The black hole, designated NGC 4258-BH, sits approximately 23 million light-years from Earth and has a mass equivalent to 36 million suns. The new images show material swirling around the event horizon at temperatures exceeding 10 million degrees Celsius.

The discovery could help scientists better understand how black holes grow over cosmic timescales and the role they play in shaping the galaxies that surround them. Further observations are planned over the next 18 months.',
  'EARTH',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&h=480&q=80',
  'Dr. Lena Hoffman',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
  'Science editor and astrophysics writer. Former researcher at the European Southern Observatory.',
  false
),
(
  'FIFA World Cup 2026: Host Cities Unveil Stadium Upgrades',
  'With less than a year to go before the biggest football tournament on the planet, host cities across the United States, Canada, and Mexico have revealed major stadium renovations.',
  'Preparations for the 2026 FIFA World Cup are accelerating, with six host cities unveiling major upgrades to their stadiums and surrounding infrastructure this week. The tournament — the first to feature 48 national teams — is set to be the largest in the competition''s history.

In New York, the newly renovated MetLife Stadium will serve as the venue for the final match, with organizers confirming a seating capacity expansion to accommodate 92,000 fans. Los Angeles''s SoFi Stadium has undergone a dramatic transformation, adding a new retractable roof section and state-of-the-art LED lighting systems.

"We want every fan, whether they''re in the stadium or watching at home, to have the most immersive experience ever," said James Whitfield, FIFA''s tournament operations director.

Mexico City''s iconic Azteca Stadium, one of only two venues to have hosted two World Cup finals, has completed a $200 million renovation that includes new seating, improved accessibility, and expanded broadcast facilities.

With over 5 million ticket requests already submitted for the group stage alone, demand is shaping up to far exceed any previous edition of the tournament. Ticket ballot results for the general public are expected to be announced next month.',
  'SPORT',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&h=480&q=80',
  'Carlos Rivera',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'Sports journalist specialising in football. Has covered four FIFA World Cups and three UEFA European Championships.',
  false
),
(
  'Ancient Silk Road Networks Discovered in East Asia',
  'Archaeologists have uncovered a vast network of previously unknown ancient trade routes in Central Asia, rewriting our understanding of early Silk Road commerce.',
  'A multinational archaeological team has discovered dozens of previously unknown ancient trading posts and road networks deep in Central Asia, reshaping historians'' understanding of early Silk Road commerce.

The sites, found across parts of Tajikistan, Kyrgyzstan, and Kazakhstan using a combination of satellite imagery and drone surveys, date back to between 200 BCE and 500 CE. Researchers uncovered the remains of caravanserais — roadside inns for traders — along with coins, pottery, and textile fragments pointing to active trade between China, Persia, and the Roman Empire.

"This completely changes our picture of how connected the ancient world was," said Prof. Yuki Tanaka of Kyoto University, who led the international research team. "We''re talking about a network far more complex and extensive than the textbooks describe."

Among the most significant finds were fragments of silk with dye patterns unique to the Han Dynasty period, found at a site in southern Kyrgyzstan — more than 3,000 kilometres from their likely origin. Carbon dating suggests they were deposited around 150 CE.

The findings, published in the journal Antiquity, have already prompted the UNESCO World Heritage Committee to consider expanding the existing Silk Road heritage designation to include several of the newly discovered sites.',
  'CULTURE',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&h=480&q=80',
  'Yuki Tanaka',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  'Professor of Asian archaeology at Kyoto University and lead researcher on multiple Central Asian expeditions.',
  false
),
(
  'Political Tensions Rise Ahead of Key European Union Summit',
  'European leaders are gathering for a critical summit as divisions over migration policy, defence spending, and economic reform threaten to fracture the bloc''s unified front.',
  'European Union leaders are convening in Brussels this week for what analysts describe as one of the most consequential summits in years, as deep divisions over migration, defence spending, and economic policy threaten to overshadow the bloc''s carefully managed unity.

The meeting comes after weeks of tense negotiations over a proposed revision to EU migration rules, with eastern European member states pushing back against a mandatory quota system for distributing asylum seekers. Meanwhile, southern European nations are pressing for more generous access to the bloc''s shared economic recovery funds.

"There is no easy consensus in sight," said Eliza Müller, EU policy director at the Berlin-based European Council on Foreign Relations. "The gaps between member states on the key issues are larger than they''ve been at any point in the last decade."

Defence spending is also on the agenda, with NATO allies pressing EU members to commit to a minimum of 2.5% of GDP by 2027 — up from the current 2% target. Several member states, including Germany and France, have indicated support for the higher threshold, but smaller economies argue they cannot afford the increase without sacrificing social spending.

Talks are expected to run through the weekend, with leaders aiming to release a joint communiqué on Sunday evening.',
  'POLITICS',
  'https://images.unsplash.com/photo-1554672408-730436b60dde?auto=format&fit=crop&w=800&h=480&q=80',
  'Sophie Durand',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80',
  'EU political correspondent based in Brussels. Former advisor to the European Parliament''s Committee on Civil Liberties.',
  false
),
(
  'Budget Airlines Reshape Travel as Passenger Numbers Hit Record',
  'Low-cost carriers are reporting record passenger numbers as travellers increasingly choose budget flights over premium alternatives, disrupting the traditional airline industry model.',
  'Budget airlines are experiencing their best year on record, with low-cost carriers collectively reporting a 22% increase in passenger numbers compared to pre-pandemic levels. The surge is reshaping the global aviation landscape and putting pressure on legacy carriers to cut costs and rethink their business models.

Europe''s largest budget carrier reported carrying 185 million passengers in the past 12 months, a new all-time high, while its rival in the US surpassed 200 million passengers for the first time. Both attributed the growth to pent-up post-pandemic demand, falling fuel costs, and strong consumer appetite for affordable travel.

"Travellers are voting with their wallets," said Ingrid Olsen, an aviation analyst at Nordea Markets. "The gap in value between budget and traditional carriers has never been wider, and consumers are clearly choosing price."

Legacy airlines are responding by expanding their own low-cost subsidiaries and stripping back the frills on short-haul routes. Several major flag carriers have also announced new partnerships with budget operators to offer connecting itineraries that compete with point-to-point low-cost routes.

Airport congestion remains a significant challenge, with London Heathrow, Amsterdam Schiphol, and Dubai International all operating at or above capacity during peak summer months. Aviation authorities in the EU are considering new slot regulations to ease bottlenecks.',
  'TRAVEL',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&h=480&q=80',
  'Ingrid Olsen',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=150&h=150&q=80',
  'Travel and aviation writer covering global transport trends, airline strategy, and sustainable tourism.',
  false
),
(
  'Streaming Wars Heat Up as New Platform Launches',
  'A major new streaming service backed by a Hollywood studio alliance has launched, intensifying competition in an already crowded market dominated by Netflix, Disney+, and Amazon.',
  'The streaming wars entered a new phase this week with the launch of Nexus+, a joint streaming venture backed by three major Hollywood studios. The platform promises exclusive access to a library of over 10,000 titles at launch, along with original content produced specifically for the service.

Nexus+ is positioning itself as a premium-tier alternative to Netflix and Disney+, targeting audiences aged 35 and above with a focus on drama, documentary, and prestige television. The service launches at $14.99 per month with an ad-supported tier available at $7.99.

"We believe there is significant room in the market for a service that speaks to a slightly older, more sophisticated audience," said Rachel Kim, Nexus+ Chief Content Officer, at the platform''s global launch event in Los Angeles.

Reaction from Wall Street was cautious. Shares in Netflix dipped slightly on the announcement before recovering, while analysts noted that subscriber growth across all major platforms has begun to plateau in saturated markets like North America and Western Europe.

The real battle, experts say, will be fought in emerging markets. India, Southeast Asia, and Latin America remain high-growth regions where streaming penetration is still relatively low, and where local content is increasingly a deciding factor for subscribers.',
  'CULTURE',
  'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&h=480&q=80',
  'Rachel Kim',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'Entertainment industry analyst covering streaming, studio strategy, and the future of digital media.',
  false
),
(
  'Climate Summit: Nations Agree on New Emissions Reduction Targets',
  'World leaders have reached a landmark agreement on emissions reduction targets, pledging to limit global temperature rise to 1.5 degrees Celsius above pre-industrial levels.',
  'World leaders gathered in Geneva this week reached a landmark climate agreement, pledging more aggressive emissions reduction targets and committing new funding to help developing nations transition away from fossil fuels.

The accord, signed by 157 countries, sets a collective target of cutting greenhouse gas emissions by 50% compared to 2010 levels by 2035 — a significant step beyond the commitments made at previous summits. Crucially, major economies including the United States, China, the European Union, and India agreed to phase out coal power by 2030 for developed nations and 2040 for developing economies.

"Today marks a turning point," said UN Secretary-General Antonio Guterres in his closing remarks. "The science is clear. The window to act is narrow. And for the first time, we have a plan that matches the urgency of the moment."

The agreement includes a new $500 billion annual climate finance package, pooling contributions from developed nations to support green energy transitions in the Global South. Environmental groups, while welcoming the deal, cautioned that implementation and accountability mechanisms would be critical to its success.

Some developing nations raised concerns about the pace of the transition and the adequacy of the financing package, arguing that richer countries bear greater historical responsibility for accumulated emissions.',
  'EARTH',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&h=480&q=80',
  'Anna Schmidt',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=150&h=150&q=80',
  'Environmental journalist covering climate policy, international summits, and the global energy transition.',
  true
);

-- ─────────────────────────────────────────────
--  6. SEED DATA — Flash News
-- ─────────────────────────────────────────────
insert into public.flash_news (text) values
  ('Everyday News is now live — powered by Supabase. Real-time updates coming soon.'),
  ('Global markets rally as technology sector hits record high valuation.'),
  ('New archaeological discoveries in East Asia reveal ancient Silk Road networks.'),
  ('NASA James Webb telescope captures unprecedented details of supermassive black hole.'),
  ('Climate Summit: 157 nations sign landmark emissions reduction agreement in Geneva.');
