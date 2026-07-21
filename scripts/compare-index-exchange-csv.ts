/**
 * Compare index_exchange.csv segment names against audiences in Supabase.
 *
 * Usage: npx tsx scripts/compare-index-exchange-csv.ts
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

function normalizeTaxonomy(s: string): string {
  let t = s.trim();
  t = t.replace(/\s*>\s*/g, ' > ');
  t = t.replace(/\s+/g, ' ');
  return t.trim();
}

function canonicalForCompare(s: string): string {
  let t = normalizeTaxonomy(s);
  t = t.replace(/\bGen Z\s*\(\s*18\+\s*\)/gi, 'Gen Z');
  t = t.replace(/\s*\(\s*FOWS\s*\)/gi, '');
  t = t.replace(/\s+/g, ' ');
  return t.trim();
}

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  );

  const csvContent = fs.readFileSync('data/index_exchange.csv', 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const segmentNames = records
    .map((r: Record<string, string>) => r['Segment Name']?.trim())
    .filter(Boolean);
  const uniqueSegmentNames = [...new Set(segmentNames)];

  console.log('CSV rows:', records.length);
  console.log('Unique segment names:', uniqueSegmentNames.length);

  let allAudiences: { name: string }[] = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('audiences')
      .select('name')
      .order('name', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (data) {
      allAudiences = [...allAudiences, ...data];
      hasMore = data.length === pageSize;
      from += pageSize;
    } else {
      hasMore = false;
    }
  }

  const dbNames = new Set(allAudiences.map((a) => a.name.trim()));
  console.log('DB audiences:', allAudiences.length);

  const exactMatches = uniqueSegmentNames.filter((name) => dbNames.has(name));
  const missing = uniqueSegmentNames.filter((name) => !dbNames.has(name));

  console.log('\n=== EXACT MATCH RESULTS ===');
  console.log(`Exact matches: ${exactMatches.length} / ${uniqueSegmentNames.length}`);
  console.log(`Missing: ${missing.length}`);

  const dbNamesNormalized = new Map<string, string>();
  for (const name of dbNames) {
    dbNamesNormalized.set(canonicalForCompare(name).toLowerCase(), name);
  }

  const normalizedMatches: { csv: string; db: string }[] = [];
  const stillMissing: string[] = [];

  for (const name of missing) {
    const norm = canonicalForCompare(name).toLowerCase();
    const dbMatch = dbNamesNormalized.get(norm);
    if (dbMatch) {
      normalizedMatches.push({ csv: name, db: dbMatch });
    } else {
      stillMissing.push(name);
    }
  }

  console.log('\n=== NORMALIZED MATCHES (among exact misses) ===');
  console.log(`Normalized matches: ${normalizedMatches.length}`);
  console.log(`Still missing: ${stillMissing.length}`);

  const totalCovered = exactMatches.length + normalizedMatches.length;
  console.log('\n=== TOTAL COVERAGE ===');
  console.log(
    `Covered (exact + normalized): ${totalCovered} / ${uniqueSegmentNames.length} (${((totalCovered / uniqueSegmentNames.length) * 100).toFixed(1)}%)`
  );

  if (normalizedMatches.length > 0) {
    console.log('\nNormalized match examples (CSV -> DB):');
    normalizedMatches.slice(0, 15).forEach((m) => {
      console.log(`  CSV: ${m.csv}`);
      console.log(`  DB:  ${m.db}\n`);
    });
    if (normalizedMatches.length > 15) {
      console.log(`  ... and ${normalizedMatches.length - 15} more`);
    }
  }

  if (stillMissing.length > 0) {
    console.log('\nMissing segment names:');
    stillMissing.forEach((n) => console.log(`  - ${n}`));
  }

  const outPath = 'data/index-exchange-csv-db-comparison.json';
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        csvRows: records.length,
        uniqueSegmentNames: uniqueSegmentNames.length,
        dbAudiences: allAudiences.length,
        exactMatches: exactMatches.length,
        normalizedMatches: normalizedMatches.length,
        stillMissing: stillMissing.length,
        totalCovered,
        coveragePercent: (totalCovered / uniqueSegmentNames.length) * 100,
        missingSegmentNames: stillMissing,
        normalizedMatchPairs: normalizedMatches,
      },
      null,
      2
    )
  );
  console.log(`\nWrote detailed results to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
