import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.error(
    'ClarityMD: Supabase credentials missing. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
