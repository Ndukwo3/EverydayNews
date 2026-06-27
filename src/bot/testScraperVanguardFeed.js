import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

const parser = new Parser();

async function test() {
  const feed = await parser.parseURL('https://www.vanguardngr.com/feed/');
  const item = feed.items.find(i => i.title.includes('Ivory Coast')) || feed.items[0];
  if (!item) {
    console.log('No articles found in feed');
    return;
  }
  
  console.log('Title:', item.title);
  console.log('Link:', item.link);
  console.log('Description has img:', item.description?.includes('<img'));
  
  // Run findImageUrl logic
  const imgUrl = await findImageUrl(item, 'NEWS');
  console.log('Scraped Image URL:', imgUrl);
}

async function findImageUrl(item, category) {
  if (item.link) {
    try {
      const res = await fetch(item.link, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' },
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
            return contentMatch[1].replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, '$1');
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch main image:`, err.message);
    }
  }

  const desc = item.description || item.contentSnippet || item.content || '';
  if (desc) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = desc.match(imgRegex);
    if (match && match[1]) {
      return match[1].replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, '$1');
    }
  }

  return 'fallback';
}

test();
