import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczMDA2NCwiZXhwIjoyMDk3MzA2MDY0fQ.zBf0xoIH29BqF58rCcR_pgoDbRPOe1SII_ZNZ8jgO3M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const PROMO_PHRASES = [
  'download',
  'qr code',
  'follow us',
  'newsletter',
  'play store',
  'app store',
  'continue reading',
  'stay informed and ahead',
  "don't miss a headline",
  'stay in the know',
  'print replica',
  'amazon prime video',
  'continue with amazon',
  'everyday newsng.com',
  'punchng.com',
  'vanguardngr.com',
  'everyday news app',
  'news app',
  'brand press',
  'informational purpose only',
  'investment guidance',
  'due diligence',
  'created independently of',
  'dynamic readership',
  'connect with us',
  'roundup of happenings',
  '5-minute roundup',
  'inbox every weekday',
  'seasoned editors',
  'blends ai speed',
  'biggest stories',
  'skip the noise',
  'digest you can trust',
  'cbn gives banks and fintechs',
  'storipod wants to make reading',
  'independent stories about',
  'evolution of tech',
  'never miss a beat on tech',
  'news digest, we discuss',
  'news digest, we talk',
  'news digest, we outline',
  'tc daily',
  'techcabal daily',
  'techcabal digest',
  'everyday news digest'
];

const CODE_INDICATORS = [
  'typeof',
  'escapeExpression',
  'helperMissing',
  'nullContext',
  'loc:{',
  'function(',
  'display:',
  '/*',
  '*/',
  '{ display:',
  'margin:',
  'padding:'
];

function shouldFilterParagraph(pText) {
  const lower = pText.toLowerCase();
  
  // Check code indicators
  const isCode = CODE_INDICATORS.some(ind => pText.includes(ind));
  if (isCode) return true;
  
  // Check promo phrases
  const isPromo = PROMO_PHRASES.some(phrase => lower.includes(phrase));
  if (isPromo) return true;
  
  return false;
}

function cleanBody(body) {
  if (!body) return '';
  const paragraphs = body.split(/\n+/);
  const cleaned = paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 30 && !shouldFilterParagraph(p));
  return cleaned.join('\n\n');
}

async function cleanDatabase() {
  const tables = ['articles', 'editors_picks', 'trending_articles', 'story_articles'];
  for (const table of tables) {
    console.log(`Cleaning table: ${table}`);
    const { data: records, error } = await supabase.from(table).select('id, body');
    if (error) {
      console.error(`Error loading from ${table}:`, error);
      continue;
    }
    
    for (const record of records) {
      if (!record.body) continue;
      const cleaned = cleanBody(record.body);
      if (cleaned !== record.body) {
        console.log(`Updating record ${record.id} in ${table}...`);
        const { error: updateError } = await supabase
          .from(table)
          .update({ body: cleaned })
          .eq('id', record.id);
        if (updateError) {
          console.error(`Failed to update record ${record.id} in ${table}:`, updateError);
        }
      }
    }
  }
  console.log('Cleanup finished!');
  process.exit(0);
}

cleanDatabase();
