/**
 * manageUsers.js
 *
 * Checks registered auth users in Supabase and automatically confirms their email
 * verification so they can log in without email confirmation errors.
 * Run manually: node src/bot/manageUsers.js
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

async function manageUsers() {
  console.log('Fetching users from Supabase Auth...');
  
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No users found in Supabase Auth.');
      return;
    }

    console.log(`Found ${users.length} user(s).`);

    for (const user of users) {
      const emailConfirmed = !!user.email_confirmed_at;
      console.log(`- Email: ${user.email} | Confirmed: ${emailConfirmed}`);

      if (!emailConfirmed) {
        console.log(`Auto-confirming email for user ${user.email}...`);
        const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        );

        if (updateError) {
          console.error(`Failed to confirm ${user.email}:`, updateError.message);
        } else {
          console.log(`Successfully confirmed email for ${user.email}!`);
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

manageUsers();
