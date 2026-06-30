const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzAwNjQsImV4cCI6MjA5NzMwNjA2NH0.h1fowsc8E0q5h1d74FywS0vAHLaF-l_pDOueG2nNtow';

async function checkSlugs() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,title,slug&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const data = await res.json();
    console.log("ARTICLES SLUG LOG:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

checkSlugs();
