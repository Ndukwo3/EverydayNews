async function test() {
  const item = {
    link: 'https://www.vanguardngr.com/2026/06/ivory-coast-beat-curacao-2-0-to-reach-world-cup-knockout-stage/',
    description: '<img width="225" height="225" src="https://cdn.vanguardngr.com/wp-content/uploads/2023/01/Artboard-1.png" class="attachment-large size-large wp-post-image" alt="Ivory Coast beat Curacao 2-0 to reach World Cup knockout stage" />'
  };

  console.log('--- RUNNING findImageUrl SIMULATION ---');
  if (item.link) {
    try {
      console.log('Step 1: Fetching link...');
      const res = await fetch(item.link, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(15000)
      });
      console.log('Fetch Status:', res.status);
      const html = await res.text();
      console.log('HTML Length:', html.length);
      
      const metaRegex = /<meta\s+[^>]*>/gi;
      let match;
      let found = null;
      while ((match = metaRegex.exec(html)) !== null) {
        const metaTag = match[0];
        const isOgImage = /property=["']og:image["']/i.test(metaTag) || /name=["']og:image["']/i.test(metaTag);
        if (isOgImage) {
          const contentMatch = /content=["']([^"']+)["']/i.exec(metaTag);
          if (contentMatch && contentMatch[1]) {
            found = contentMatch[1].replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, '$1');
            console.log('Step 1 Found:', found);
            break;
          }
        }
      }
      if (found) return;
    } catch (err) {
      console.warn(`Failed to fetch main image:`, err.message);
    }
  }

  console.log('Step 2: Checking description...');
  const desc = item.description || '';
  if (desc) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = desc.match(imgRegex);
    if (match && match[1]) {
      const found = match[1].replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, '$1');
      console.log('Step 2 Found:', found);
    }
  }
}
test();
