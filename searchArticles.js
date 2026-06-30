const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzAwNjQsImV4cCI6MjA5NzMwNjA2NH0.h1fowsc8E0q5h1d74FywS0vAHLaF-l_pDOueG2nNtow';

async function searchArticles(query) {
  const tables = ['articles', 'editors_picks', 'trending_articles', 'story_articles'];
  for (const table of tables) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?title=ilike.%25${encodeURIComponent(query)}%25&select=id,title,slug`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      const data = await res.json();
      if (data.length > 0) {
        console.log(`FOUND IN "${table.toUpperCase()}":`);
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(`Search in ${table} failed:`, err.message);
    }
  }
}

searchArticles("NDC");
searchArticles("Uruguay");
searchArticles("Tems");
