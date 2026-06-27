/**
 * testScrapeUrl.js — Test Lagos tourism article
 */

async function testScrape() {
  const url = 'https://punchng.com/lagos-urges-tourism-stakeholders-to-safeguard-environment-culture-arts/amp/';
  console.log(`Fetching from AMP: ${url}`);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
    });
    const html = await res.text();

    console.log('HTML length:', html.length);

    const pRegex = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi;
    let match;
    let index = 1;

    while ((match = pRegex.exec(html)) !== null) {
      const raw = match[1];
      console.log(`\n--- PARAGRAPH ${index++} ---`);
      console.log('Raw:', raw.substring(0, 150).trim());
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testScrape();
