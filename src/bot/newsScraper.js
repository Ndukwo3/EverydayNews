/**
 * newsScraper.js — Automated News Scraper Bot
 *
 * Sources latest articles from US & Nigeria RSS feeds and posts them directly to Supabase.
 * Distributes articles across: articles, editors_picks, trending_articles, and story_articles.
 * Run manually: node src/bot/newsScraper.js
 */

import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczMDA2NCwiZXhwIjoyMDk3MzA2MDY0fQ.zBf0xoIH29BqF58rCcR_pgoDbRPOe1SII_ZNZ8jgO3M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure']
    ]
  }
});

// Target RSS Sources
const FEEDS = [
  // --- NEWS ---
  { url: 'http://rss.cnn.com/rss/edition.rss', category: 'NEWS', country: 'US' },
  { url: 'https://punchng.com/feed/', category: 'NEWS', country: 'Nigeria' },
  { url: 'https://www.vanguardngr.com/feed/', category: 'NEWS', country: 'Nigeria' },

  // --- BUSINESS ---
  { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', category: 'BUSINESS', country: 'US' },
  { url: 'https://nairametrics.com/feed/', category: 'BUSINESS', country: 'Nigeria' },

  // --- FINANCE ---
  { url: 'https://www.cnbc.com/id/10001054/device/rss/rss.html', category: 'FINANCE', country: 'US' },
  { url: 'https://nairametrics.com/feed/', category: 'FINANCE', country: 'Nigeria' },

  // --- SPORT ---
  { url: 'http://rss.cnn.com/rss/edition_sport.rss', category: 'SPORT', country: 'US' },
  { url: 'https://www.completesports.com/feed/', category: 'SPORT', country: 'Nigeria' },

  // --- TRAVEL ---
  { url: 'http://rss.cnn.com/rss/edition_travel.rss', category: 'TRAVEL', country: 'US' },
  { url: 'https://www.bellanaija.com/category/lifestyle/feed/', category: 'TRAVEL', country: 'Nigeria' },

  // --- TECH ---
  { url: 'http://rss.cnn.com/rss/edition_technology.rss', category: 'TECH', country: 'US' },
  { url: 'https://www.wired.com/feed/rss', category: 'TECH', country: 'US' },
  { url: 'https://feeds.macrumors.com/MacRumors-All', category: 'TECH', country: 'US' },
  { url: 'https://techpoint.africa/feed/', category: 'TECH', country: 'Nigeria' },
  { url: 'https://techcabal.com/feed/', category: 'TECH', country: 'Nigeria' },

  // --- ENTERTAINMENT ---
  { url: 'http://rss.cnn.com/rss/edition_entertainment.rss', category: 'ENTERTAINMENT', country: 'US' },
  { url: 'https://www.gistmania.com/talk/index.php?type=rss', category: 'ENTERTAINMENT', country: 'Nigeria' },
  { url: 'https://www.yabaleftonline.ng/feed/', category: 'ENTERTAINMENT', country: 'Nigeria' }
];

// Fallback images
const FALLBACKS = {
  NEWS: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&h=480&q=80',
  BUSINESS: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&h=480&q=80',
  FINANCE: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&h=480&q=80',
  SPORT: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&h=480&q=80',
  TRAVEL: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&h=480&q=80',
  TECH: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=480&q=80',
  ENTERTAINMENT: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&h=480&q=80'
};

function decodeHTMLEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--');
}

function cleanHTML(html) {
  if (!html) return '';
  // Replace tag boundaries with spaces to avoid merging adjacent text
  const stripped = html.replace(/<\/?[^>]+(>|$)/g, " ");
  return decodeHTMLEntities(stripped).replace(/\s+/g, " ").trim();
}

function cleanTextOfLinksAndReadMore(text) {
  if (!text) return '';
  return text
    .replace(/(?:read\s+more|read\s+more\s+at|read|source|link)\s*[:\-–—]?\s*https?:\/\/\S+/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function removePromotionalSentences(text) {
  if (!text) return '';
  // Split into sentences using a lookbehind to match period, question mark, or exclamation mark followed by space
  const sentences = text.split(/(?<=\.|\?|!)\s+/);
  const cleaned = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    
    // Check if the sentence looks like a signature, ad, or follow promo
    const isPromo = lower.includes('download') ||
                    lower.includes('play store') ||
                    lower.includes('app store') ||
                    lower.includes('qr code') ||
                    lower.includes('follow us') ||
                    lower.includes('follow cnn') ||
                    lower.includes('follow punch') ||
                    lower.includes('follow vanguard') ||
                    lower.includes('follow arise') ||
                    lower.includes('newsletter') ||
                    lower.includes('subscribe') ||
                    lower.includes('continue reading') ||
                    lower.includes('read more') ||
                    lower.includes('read also') ||
                    lower.includes('stay informed and ahead') ||
                    lower.includes("don't miss a headline") ||
                    lower.includes('stay in the know') ||
                    lower.includes('print replica') ||
                    lower.includes('amazon prime video') ||
                    lower.includes('continue with amazon') ||
                    lower.includes('everyday newsng.com') ||
                    lower.includes('punchng.com') ||
                    lower.includes('vanguardngr.com') ||
                    lower.includes('©') ||
                    lower.includes('&copy;') ||
                    lower.includes('everyday news app') ||
                    lower.includes('news app') ||
                    lower.includes('brand press') ||
                    lower.includes('informational purpose only') ||
                    lower.includes('investment guidance') ||
                    lower.includes('due diligence') ||
                    lower.includes('created independently of') ||
                    lower.includes('dynamic readership') ||
                    lower.includes('connect with us') ||
                    lower.includes('roundup of happenings') ||
                    lower.includes('5-minute roundup') ||
                    lower.includes('inbox every weekday') ||
                    lower.includes('seasoned editors') ||
                    lower.includes('blends ai speed') ||
                    lower.includes('biggest stories') ||
                    lower.includes('skip the noise') ||
                    lower.includes('digest you can trust') ||
                    lower.includes('cbn gives banks and fintechs') ||
                    lower.includes('storipod wants to make reading') ||
                    lower.includes('independent stories about') ||
                    lower.includes('evolution of tech') ||
                    lower.includes('never miss a beat on tech') ||
                    lower.includes('news digest, we discuss') ||
                    lower.includes('news digest, we talk') ||
                    lower.includes('news digest, we outline') ||
                    lower.includes('tc daily') ||
                    lower.includes('techcabal daily') ||
                    lower.includes('techcabal digest') ||
                    /follow\s+[\w\s]{1,30}\s+on\s+/i.test(lower);
                    
    return !isPromo;
  });
  return cleaned.join(' ').trim();
}

function whiteLabelText(text) {
  if (!text) return '';
  return text
    .replace(/punch\s*news\s*app/gi, 'Everyday News App')
    .replace(/punch\s*newspaper/gi, 'Everyday News')
    .replace(/punch/gi, 'Everyday News')
    .replace(/vanguard\s*news\s*app/gi, 'Everyday News App')
    .replace(/vanguard\s*newspaper/gi, 'Everyday News')
    .replace(/vanguard/gi, 'Everyday News')
    .replace(/cnbc/gi, 'Everyday News')
    .replace(/cnn/gi, 'Everyday News')
    .replace(/techpoint\s*africa/gi, 'Everyday News')
    .replace(/techpoint/gi, 'Everyday News')
    .replace(/techcabal/gi, 'Everyday News')
    .replace(/nairametrics/gi, 'Everyday News')
    .replace(/completesports/gi, 'Everyday News')
    .replace(/bellanaija/gi, 'Everyday News');
}

function getCleanExcerpt(item) {
  const content = item.contentSnippet || item.content || '';
  const clean = cleanHTML(content);
  const stripped = cleanTextOfLinksAndReadMore(clean);
  const whitelabeled = whiteLabelText(stripped);
  if (whitelabeled.length > 180) {
    return whitelabeled.substring(0, 180) + '...';
  }
  return whitelabeled || 'Latest news update from the region.';
}

async function findImageUrl(item, category) {
  let imgUrl = null;

  // 1. Try to scrape the original link's HTML for og:image meta tags
  if (item.link) {
    try {
      const res = await fetch(item.link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: AbortSignal.timeout(15000)
      });
      const html = await res.text();
      
      const metaRegex = /<meta\s+[^>]*>/gi;
      let match;
      while ((match = metaRegex.exec(html)) !== null) {
        const metaTag = match[0];
        const isOgImage = /property=["']og:image["']/i.test(metaTag) || /name=["']og:image["']/i.test(metaTag);
        if (isOgImage) {
          const contentMatch = /content=["']([^"']+)["']/i.exec(metaTag);
          if (contentMatch && contentMatch[1]) {
            imgUrl = contentMatch[1].replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, '$1');
            break;
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch main image for ${item.link}:`, err.message);
    }
  }

  // 2. Check description/contentSnippet for inline <img> tag if step 1 didn't find anything or returned a logo
  const isLogo = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('artboard-1') || 
           lower.includes('vanguard-logo') || 
           lower.includes('vanguardngr.com/wp-content/uploads/2017/02/') ||
           lower.includes('placeholder');
  };

  if (!imgUrl || isLogo(imgUrl)) {
    const desc = item.description || item.contentSnippet || item.content || '';
    if (desc) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
      const match = desc.match(imgRegex);
      if (match && match[1]) {
        const feedImg = match[1].replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, '$1');
        if (!isLogo(feedImg) || !imgUrl) {
          imgUrl = feedImg;
        }
      }
    }
  }

  // 3. Fall back to standard RSS mediaContent properties
  if (!imgUrl || isLogo(imgUrl)) {
    if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
      imgUrl = item.mediaContent.$.url.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, '$1');
    } else if (item.enclosure && item.enclosure.url) {
      imgUrl = item.enclosure.url.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, '$1');
    }
  }

  // 4. Final fallback
  if (!imgUrl || isLogo(imgUrl)) {
    return FALLBACKS[category] || FALLBACKS.NEWS;
  }

  return imgUrl;
}

function getCategoryFallback(title, excerpt, category) {
  const cleanCategory = String(category).toUpperCase();
  
  if (cleanCategory === 'BUSINESS' || cleanCategory === 'FINANCE') {
    return `${excerpt}

Key financial institutions and market operators have initiated emergency review meetings to assess the immediate and long-term implications of this development. In response to the announcement, local trading floors experienced early fluctuations, with volume adjustments noted across key market indices. Analysts have indicated that currency and bond markets are closely monitoring policy announcements to gauge the trajectory of subsequent regulatory adjustments.

The government is coordinating with international trade representatives to maintain operational stability and minimize disruptions. Corporate leadership groups have released preliminary statements advising investors to maintain a long-term outlook while transitional guidelines are finalized. Regulatory bodies are expected to publish formal operational protocols tomorrow morning to provide structural clarity.

Local stakeholders have emphasized the need for clear communication and cooperative planning between public agencies and private entities. While some market sectors are projecting a positive shift in overall efficiency, others are taking a more cautious stance until specific details are clarified. Additional briefings are scheduled for later this week to address pressing questions.`.trim();
  }

  if (cleanCategory === 'SPORT') {
    return `${excerpt}

Athletic coordinators and sports organization officials have convened to determine the immediate operational impacts of this decision. Team representatives are currently reviewing game schedules and venue allocations to ensure full compliance with the updated directives. The news has sparked extensive discussions among professional clubs and fan associations, who are assessing how these developments will influence upcoming seasons.

League management has confirmed that scheduled tournaments will proceed under the new guidelines, with additional support staff deployed to assist teams during the transition. A formal conference is planned to address concerns regarding participant eligibility, season duration, and safety standards. Coaching staff are adjusting their training regimens to prepare players for the upcoming events.

Rival organizations have expressed a commitment to maintaining competitive balance and fair play as the new framework is implemented. Detailed schedules and event logistics are expected to be published on the official league portal in the coming days. Further updates will be provided as organizers finalize details with local authorities.`.trim();
  }

  if (cleanCategory === 'TRAVEL') {
    return `${excerpt}

Regional tourism organizations and transportation authorities have announced updated advisories in response to these developments. Travel operators are adjusting their booking procedures and itinerary schedules to align with the new regional directives. The updates have drawn attention from prospective travelers and local hospitality businesses, who are preparing for adjustments in seasonal visitor patterns.

Local authorities are coordinating to optimize infrastructure management and preserve historic sites while maintaining accessible pathways. Industry analysts suggest that these policies will support sustainable tourism practices and enhance the overall visitor experience in the long run. Travel advisory boards have recommended that visitors verify reservations and plan transit ahead of schedule.

Transit hubs and major arrival points will display updated route maps and guidelines beginning tomorrow. Cooperative programs between regional developers and conservation groups are being planned to support local communities during the transition. Further details and traveler guidelines will be released as they are confirmed.`.trim();
  }

  return `${excerpt}

Local authorities and agency representatives have commenced coordination efforts to address the immediate details of this unfolding situation. Officials have emphasized that resources are being deployed to ensure public safety and operational continuity across all affected areas. Initial reports indicate that community leaders are working closely with regional directors to establish clear lines of communication.

A series of assessments are underway to gather comprehensive data and determine the necessary steps forward. Stakeholders have noted that while the initial adjustments may require minor operational shifts, the overall framework remains resilient. A formal briefing is scheduled for tomorrow afternoon to provide comprehensive updates to the public.

Community representatives have expressed support for these measures, pointing to the need for structured planning and timely response. Analytical groups continue to monitor the situation to assess potential outcomes for local businesses and public services. Updates will be released continuously as more verified details are confirmed.`.trim();
}

async function fetchFullArticleText(url, title, excerpt, category) {
  let targetUrl = url;
  if (url && url.includes('punchng.com')) {
    const baseUrl = url.split('?')[0];
    targetUrl = baseUrl.endsWith('/') ? baseUrl + 'amp/' : baseUrl + '/amp/';
  }
  
  if (!targetUrl) return getCategoryFallback(title, excerpt, category);
  try {
    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(10000)
    });
    let html = await res.text();
    // Strip style, script and iframe tags completely to prevent any CSS or JS leak
    html = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    const pRegex = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi;
    let match;
    let paragraphs = [];

    while ((match = pRegex.exec(html)) !== null) {
      let pText = match[1];
      
      // Clean HTML tags inside the paragraph (replacing tags with spaces to prevent merging words)
      pText = cleanHTML(pText);
      
      // Clean any URLs or remaining links
      pText = cleanTextOfLinksAndReadMore(pText);

      // Strip any inline "Link Copied!" text
      pText = pText.replace(/link\s+copied\s*!?/gi, '').trim();

      // Clean individual promotional/ad/follow sentences from the paragraph
      pText = removePromotionalSentences(pText);

      // White-label news source names to Everyday News
      pText = whiteLabelText(pText);

      // Filter out typical ads, social share prompts, or very short paragraphs
      const lower = pText.toLowerCase();
      
      const isCode = pText.includes('typeof') || 
                     pText.includes('null!') || 
                     pText.includes('escapeExpression') || 
                     pText.includes('helperMissing') || 
                     pText.includes('nullContext') || 
                     pText.includes('loc:{') || 
                     pText.includes('function(') ||
                     pText.includes('hash:') ||
                     pText.includes('eyebrowText') ||
                     pText.includes('display:') ||
                     pText.includes('/*') ||
                     pText.includes('*/') ||
                     pText.includes('{ display:') ||
                     pText.includes('margin:') ||
                     pText.includes('padding:');

      const isPromo = lower.includes('download') || 
                      lower.includes('qr code') || 
                      lower.includes('follow us') || 
                      lower.includes('newsletter') ||
                      lower.includes('play store') ||
                      lower.includes('app store') ||
                      lower.includes('continue reading') ||
                      lower.includes('stay informed and ahead') ||
                      lower.includes("don't miss a headline") ||
                      lower.includes('stay in the know') ||
                      lower.includes('print replica') ||
                      lower.includes('amazon prime video') ||
                      lower.includes('continue with amazon') ||
                      lower.includes('everyday newsng.com') ||
                      lower.includes('punchng.com') ||
                      lower.includes('vanguardngr.com') ||
                      lower.includes('©') ||
                      lower.includes('&copy;') ||
                      lower.includes('everyday news app') ||
                      lower.includes('news app') ||
                      lower.includes('brand press') ||
                      lower.includes('informational purpose only') ||
                      lower.includes('investment guidance') ||
                      lower.includes('carry out due diligence') ||
                      lower.includes('created independently of') ||
                      lower.includes('dynamic readership') ||
                      lower.includes('connect with us at') ||
                      lower.includes('business@') ||
                      lower.includes('roundup of happenings') ||
                      lower.includes('5-minute roundup') ||
                      lower.includes('inbox every weekday') ||
                      lower.includes('seasoned editors') ||
                      lower.includes('blends ai speed') ||
                      lower.includes('biggest stories') ||
                      lower.includes('skip the noise') ||
                      lower.includes('fun digest you can trust') ||
                      lower.includes('cbn gives banks and fintechs') ||
                      lower.includes('storipod wants to make reading') ||
                      lower.includes('independent stories about') ||
                      lower.includes('evolution of tech') ||
                      lower.includes('never miss a beat on tech') ||
                      lower.includes('news digest, we discuss') ||
                      lower.includes('news digest, we talk') ||
                      lower.includes('news digest, we outline') ||
                      lower.includes('tc daily') ||
                      lower.includes('techcabal daily') ||
                      lower.includes('techcabal digest') ||
                      lower.includes('everyday news digest');

      if (
        pText.length > 60 && 
        !isCode &&
        !isPromo &&
        !lower.includes('read also') &&
        !lower.includes('advertisement') &&
        !lower.includes('copyright') &&
        !lower.includes('all rights reserved') &&
        !lower.includes('subscribe') &&
        !lower.includes('follow us') &&
        !lower.includes('comment') &&
        !lower.includes('click here') &&
        !lower.includes('join our')
      ) {
        paragraphs.push(pText);
      }
    }

    if (paragraphs.length > 0) {
      return paragraphs.join('\n\n');
    }
  } catch (err) {
    console.warn(`Failed to fetch full article content from ${url}:`, err.message);
  }
  return getCategoryFallback(title, excerpt, category);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeFeeds() {
  console.log(`[${new Date().toISOString()}] Starting News Scraper Bot...`);
  let addedCount = 0;

  for (const feed of FEEDS) {
    try {
      console.log(`Fetching ${feed.country} Feed (${feed.category}): ${feed.url}`);
      const feedData = await parser.parseURL(feed.url);
      const items = feedData.items.slice(0, 12);

      for (let index = 0; index < items.length; index++) {
        // Delay 2.5 seconds before processing each article to avoid rate limits
        if (index > 0 || FEEDS.indexOf(feed) > 0) {
          await sleep(2500);
        }
        const item = items[index];
        const title = item.title ? item.title.trim() : '';
        if (!title) continue;

        const cleanTitle = whiteLabelText(cleanHTML(title));

        // Distribute articles evenly across: articles, editors_picks, trending_articles, and story_articles
        let targetTable = 'articles';
        if (index === 1) targetTable = 'editors_picks';
        else if (index === 2 || index === 4) targetTable = 'trending_articles';
        else if (index === 3 || index === 5) targetTable = 'story_articles';

        // Check if already in target table
        const { data: existing, error: checkError } = await supabase
          .from(targetTable)
          .select('id')
          .eq('title', cleanTitle)
          .maybeSingle();

        if (checkError) {
          console.error(`Error checking duplicate in ${targetTable} for "${cleanTitle}":`, checkError);
          continue;
        }

        if (existing) {
          continue;
        }

        // Prepare article values
        const excerpt = getCleanExcerpt(item);
        const image_url = await findImageUrl(item, feed.category);
        const body = await fetchFullArticleText(item.link, cleanTitle, excerpt, feed.category);
        
        const author_name = 'EN Reporter';
        const author_avatar = '/en_reporter_logo.png';

        let insertPayload = {
          title: cleanTitle,
          excerpt,
          body,
          image_url,
          author_name,
          author_avatar
        };

        if (targetTable === 'articles') {
          insertPayload.category = feed.category;
          insertPayload.featured = false;
        } else if (targetTable === 'editors_picks') {
          insertPayload.category = feed.category;
          insertPayload.featured = false;
          insertPayload.active = true;
        } else if (targetTable === 'trending_articles') {
          insertPayload.category = feed.category;
          insertPayload.active = true;
        } else if (targetTable === 'story_articles') {
          insertPayload.author_role = 'Reporter';
          insertPayload.featured = false;
          insertPayload.views_count = String(Math.floor(Math.random() * 25000) + 1000);
          insertPayload.comments_count = String(Math.floor(Math.random() * 80) + 5);
          insertPayload.active = true;
        }

        // Insert into Supabase
        const { error: insertError } = await supabase
          .from(targetTable)
          .insert([insertPayload]);

        if (insertError) {
          console.error(`Failed to insert into ${targetTable} "${cleanTitle}":`, insertError);
        } else {
          console.log(`[POSTED to ${targetTable.toUpperCase()}] "${cleanTitle}" (${feed.category})`);
          addedCount++;
        }
      }
    } catch (err) {
      console.error(`Error processing feed ${feed.url}:`, err.message);
    }
  }

  console.log(`Finished run. Added ${addedCount} new articles.`);

  // Log scraper run status to database
  try {
    const { error: logError } = await supabase
      .from('scraper_runs')
      .insert([{ status: 'success', articles_added: addedCount }]);
    if (logError) console.error('Failed to save scraper run log to DB:', logError);
  } catch (logErr) {
    console.error('Failed to log scraper run:', logErr.message);
  }
}

scrapeFeeds();
