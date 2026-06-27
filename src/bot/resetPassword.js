/**
 * resetPassword.js
 *
 * Resets the password for all active test accounts in Supabase Auth to a temporary password.
 * Run manually: node src/bot/resetPassword.js
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

async function resetPasswords() {
  const newPassword = 'password123';
  console.log(`Resetting passwords to: "${newPassword}"...`);
  
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Error fetching users:', error.message);
      return;
    }

    for (const user of users) {
      console.log(`Resetting password for: ${user.email}...`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error(`Failed to update ${user.email}:`, updateError.message);
      } else {
        console.log(`Successfully updated password for ${user.email}!`);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

resetPasswords();
