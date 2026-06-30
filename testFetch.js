const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzAwNjQsImV4cCI6MjA5NzMwNjA2NH0.h1fowsc8E0q5h1d74FywS0vAHLaF-l_pDOueG2nNtow';

async function testFetch(slug) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const data = await res.json();
    console.log(`QUERY FOR SLUG: "${slug}"`);
    console.log("RESULT:", data.length > 0 ? "FOUND!" : "NOT FOUND", data[0] ? { id: data[0].id, title: data[0].title } : "");
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

// Test with one of the slugs from the database
testFetch("inec-begins-ad-hoc-staff-recruitment-for-osun-governorship-poll");
testFetch("south-korea-fans-target-coach-hong-with-boos-as-world-cup-squad-returns");
