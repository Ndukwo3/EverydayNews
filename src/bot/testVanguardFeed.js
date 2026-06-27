import Parser from 'rss-parser';

async function test() {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'mediaContent'],
        ['enclosure', 'enclosure']
      ]
    }
  });

  try {
    const feed = await parser.parseURL('https://www.vanguardngr.com/feed/');
    console.log('FEED TITLE:', feed.title);
    const item = feed.items[0];
    console.log('ITEM:', JSON.stringify(item, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();
