/**
 * Re-insert World Cup audiences removed by taxonomy migration (from backup snapshot).
 *
 * Requires: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npx tsx scripts/restore-world-cup-audiences.ts --dry-run
 *   npx tsx scripts/restore-world-cup-audiences.ts --execute
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SEASONAL_YEAR = 2026;

/** From audience-migration-backups/audiences-backup-2026-04-16T16-52-06-255Z.json — tags normalized like rowToInsert (path minus leaf). */
const WORLD_CUP_AUDIENCES: {
  name: string;
  display_name: string;
  description: string;
  category: string;
  tags: string[];
  sports_league: string | null;
}[] = [
  {
    name: 'Genius Sports > Soccer > World Cup > The Parent Fan',
    display_name: 'The Parent Fan',
    description:
      'World Cup fans who are parents, often watching matches with family, interested in youth soccer programs, and passing down their passion for the beautiful game to the next generation.',
    category: 'Soccer',
    tags: ['Genius Sports', 'Soccer', 'World Cup'],
    sports_league: null,
  },
  {
    name: 'Genius Sports > Soccer > World Cup > The International Sports Fan',
    display_name: 'The International Sports Fan',
    description:
      'World Cup enthusiasts with broad international sports interests, following multiple global sporting events, leagues, and tournaments beyond soccer.',
    category: 'Soccer',
    tags: ['Genius Sports', 'Soccer', 'World Cup'],
    sports_league: null,
  },
  {
    name: 'Genius Sports > Soccer > World Cup > The Gamer Fan',
    display_name: 'The Gamer Fan',
    description:
      'World Cup fans who are also avid gamers, engaging with soccer video games like FIFA/EA Sports FC, fantasy leagues, and esports content alongside traditional World Cup viewing.',
    category: 'Soccer',
    tags: ['Genius Sports', 'Soccer', 'World Cup'],
    sports_league: null,
  },
  {
    name: 'Genius Sports > Soccer > World Cup > The Soccer Player',
    display_name: 'The Soccer Player',
    description:
      'World Cup fans who actively play soccer themselves, whether recreationally or competitively, bringing player perspective and deeper tactical appreciation to their World Cup viewing.',
    category: 'Soccer',
    tags: ['Genius Sports', 'Soccer', 'World Cup'],
    sports_league: null,
  },
  {
    name: 'Genius Sports > Soccer > World Cup > The Pop Culture Fan',
    display_name: 'The Pop Culture Fan',
    description:
      'World Cup fans drawn to the cultural phenomenon and entertainment aspects of the tournament, including celebrity connections, fashion, music, and viral moments.',
    category: 'Soccer',
    tags: ['Genius Sports', 'Soccer', 'World Cup'],
    sports_league: null,
  },
  {
    name: 'Genius Sports > International Sports > Events > FIFA World Cup',
    display_name: 'FIFA World Cup',
    description:
      'Known consumers & fans of the FIFA World Cup based on Verified Purchases and Media Activity. Powered by Officially Licensed, Deterministic, Passively Collected Event-Level Behaviors‚.-Sourced via Fluid Fan IP',
    category: 'International Sports',
    tags: ['Genius Sports', 'International Sports', 'Events'],
    sports_league: null,
  },
];

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const execute = argv.includes('--execute');
  return { dryRun, execute };
}

async function main() {
  const { dryRun, execute } = parseArgs();

  if (!dryRun && !execute) {
    console.error('Specify --dry-run or --execute');
    process.exit(1);
  }
  if (dryRun && execute) {
    console.error('Use only one of --dry-run or --execute');
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (execute && (!url || !serviceKey)) {
    console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (dryRun) {
    console.log(`Would insert up to ${WORLD_CUP_AUDIENCES.length} audiences (skipping any whose name already exists):`);
    for (const row of WORLD_CUP_AUDIENCES) {
      console.log(`  - ${row.name}`);
    }
    process.exit(0);
  }

  const supabase = createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const names = WORLD_CUP_AUDIENCES.map((r) => r.name);
  const { data: existing, error: selErr } = await supabase
    .from('audiences')
    .select('name')
    .in('name', names);

  if (selErr) {
    console.error('Lookup failed:', selErr);
    process.exit(1);
  }

  const existingSet = new Set((existing ?? []).map((r) => r.name as string));
  const toInsert = WORLD_CUP_AUDIENCES.filter((r) => !existingSet.has(r.name));

  if (toInsert.length === 0) {
    console.log('All World Cup audiences already present; nothing to insert.');
    process.exit(0);
  }

  console.log(`Inserting ${toInsert.length} row(s); skipping ${WORLD_CUP_AUDIENCES.length - toInsert.length} already present.`);

  const { error: insErr } = await supabase.from('audiences').insert(
    toInsert.map((row) => ({
      ...row,
      is_featured: false,
    })),
  );

  if (insErr) {
    console.error('Insert failed:', insErr);
    process.exit(1);
  }

  const { error: bfErr } = await supabase.rpc('backfill_audience_hierarchical_context');
  if (bfErr) {
    console.error('backfill_audience_hierarchical_context failed:', bfErr);
    process.exit(1);
  }
  console.log('backfill_audience_hierarchical_context OK');

  const { error: rfErr } = await supabase.rpc('refresh_audience_seasonal_map', {
    p_year: SEASONAL_YEAR,
  });
  if (rfErr) {
    console.error('refresh_audience_seasonal_map failed:', rfErr);
    process.exit(1);
  }
  console.log(`refresh_audience_seasonal_map(${SEASONAL_YEAR}) OK`);

  console.log('Done. If hybrid search needs vectors for new rows, run: npm run generate-embeddings');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
