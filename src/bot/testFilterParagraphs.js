/**
 * testFilterParagraphs.js — Debug paragraph filtering
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczMDA2NCwiZXhwIjoyMDk3MzA2MDY0fQ.zBf0xoIH29BqF58rCcR_pgoDbRPOe1SII_ZNZ8jgO3M';

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
  const sentences = text.split(/(?<=\.|\?|!)\s+/);
  const cleaned = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
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
                    /follow\s+[\w\s]{1,30}\s+on\s+/i.test(lower);
    return !isPromo;
  });
  return cleaned.join(' ').trim();
}

async function debugFilter() {
  const url = 'https://punchng.com/lagos-urges-tourism-stakeholders-to-safeguard-environment-culture-arts/amp/';
  console.log(`Fetching from AMP: ${url}`);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
    });
    const html = await res.text();

    const pRegex = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi;
    let match;
    let index = 1;

    while ((match = pRegex.exec(html)) !== null) {
      let pText = match[1];
      console.log(`\n=== MATCH ${index++} ===`);
      console.log('Raw:', pText.substring(0, 100).trim());

      pText = cleanHTML(pText);
      pText = cleanTextOfLinksAndReadMore(pText);
      pText = pText.replace(/link\s+copied\s*!?/gi, '').trim();
      pText = removePromotionalSentences(pText);

      const lower = pText.toLowerCase();
      const isCode = pText.includes('typeof') || 
                     pText.includes('null!') || 
                     pText.includes('escapeExpression') || 
                     pText.includes('helperMissing') || 
                     pText.includes('nullContext') || 
                     pText.includes('loc:{') || 
                     pText.includes('function(') ||
                     pText.includes('hash:') ||
                     pText.includes('eyebrowText');

      const isPromo = lower.includes('download') || 
                      lower.includes('qr code') || 
                      lower.includes('follow us') || 
                      lower.includes('newsletter') ||
                      lower.includes('play store') ||
                      lower.includes('app store') ||
                      lower.includes('continue reading');

      console.log(`Length: ${pText.length} | isCode: ${isCode} | isPromo: ${isPromo}`);
      if (pText.length > 60 && !isCode && !isPromo) {
        console.log('-> KEPT!');
      } else {
        console.log('-> SKIPPED!');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugFilter();
