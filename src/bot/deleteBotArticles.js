/**
 * deleteBotArticles.js — Database Cleanup Script
 *
 * Deletes existing bot-generated articles from the four Supabase tables:
 * articles, editors_picks, trending_articles, and story_articles.
 * Run manually: node src/bot/deleteBotArticles.js
 */

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczMDA2NCwiZXhwIjoyMDk3MzA2MDY0fQ.zBf0xoIH29BqF58rCcR_pgoDbRPOe1SII_ZNZ8jgO3M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function cleanupDatabase() {
  console.log(`[${new Date().toISOString()}] Starting Database Cleanup...`);
  const tables = ['articles', 'editors_picks', 'trending_articles', 'story_articles'];

  for (const table of tables) {
    try {
      console.log(`Deleting bot articles from table: ${table}...`);
      // Delete any article created by 'EN Reporter'
      const { data, error, count } = await supabase
        .from(table)
        .delete({ count: 'exact' })
        .eq('author_name', 'EN Reporter');

      if (error) {
        console.error(`Error deleting from ${table}:`, error.message);
      } else {
        console.log(`Successfully deleted ${count || 0} rows from ${table}.`);
      }
    } catch (err) {
      console.error(`Unexpected error during cleanup of ${table}:`, err.message);
    }
  }
  console.log('Cleanup finished.');
}

cleanupDatabase();
