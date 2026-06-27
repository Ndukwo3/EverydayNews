import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzAwNjQsImV4cCI6MjA5NzMwNjA2NH0.h1fowsc8E0q5h1d74FywS0vAHLaF-l_pDOueG2nNtow';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
