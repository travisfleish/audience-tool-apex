import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const yearArg = process.argv.find((arg) => arg.startsWith('--year='));
const year = yearArg ? Number(yearArg.split('=')[1]) : 2026;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!Number.isInteger(year) || year < 2000 || year > 2100) {
  console.error(`Invalid --year value: ${year}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`Refreshing audience seasonal map for year ${year}...`);
  const { error } = await supabase.rpc('refresh_audience_seasonal_map', { p_year: year });
  if (error) throw error;
  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
