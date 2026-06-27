async function test() {
  const url = 'https://www.vanguardngr.com/2026/06/king-charles-has-paid-more-than-30m-in-personal-taxes-since-2022-palace/';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
    });
    const html = await res.text();
    const metaRegex = /<meta\s+[^>]*>/gi;
    let match;
    while ((match = metaRegex.exec(html)) !== null) {
      const tag = match[0];
      if (/property=["']og:image["']/i.test(tag) || /name=["']og:image["']/i.test(tag)) {
        console.log('FOUND OG:IMAGE:', tag);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
test();
