/**
 * Replace all audiences from EXTERNAL - GENIUS N RIL TAXONOMY BANK.xlsx (both sheets).
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Usage:
 *   npx tsx scripts/replace-audiences-from-taxonomy.ts --dry-run
 *   npx tsx scripts/replace-audiences-from-taxonomy.ts --execute --backup-dir ./audience-migration-backups
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import XLSX from 'xlsx';

dotenv.config();

const DEFAULT_XLSX = path.join(process.cwd(), 'data/EXTERNAL - GENIUS N RIL TAXONOMY BANK.xlsx');
const BATCH_SIZE = 250;
const BACKUP_PAGE_SIZE = 1000;
const SEASONAL_YEAR = 2026;

const TAXONOMY_SEGMENTS_RE =
  /^\s*[^>]+\s*>\s*[^>]+\s*>\s*[^>]+\s*>\s*[^>]+(?:\s*>\s*[^>]+)*\s*$/;

const LEAGUES = [
  'MLB',
  'NBA',
  'NFL',
  'NHL',
  'MLS',
  'NWSL',
  'WNBA',
  'NCAA',
  'PWHL',
  'LPGA',
  'PGA',
  'UFC',
] as const;

type RawRow = {
  parent: string;
  subParent: string;
  taxonomy: string;
  description: string;
};

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const execute = argv.includes('--execute');
  let backupDir: string | null = null;
  const bi = argv.indexOf('--backup-dir');
  if (bi >= 0 && argv[bi + 1]) backupDir = argv[bi + 1];

  let xlsxPath = DEFAULT_XLSX;
  const xi = argv.indexOf('--file');
  if (xi >= 0 && argv[xi + 1]) xlsxPath = path.resolve(argv[xi + 1]);

  return { dryRun, execute, backupDir, xlsxPath };
}

function sheetRowsToRecords(sheet: XLSX.WorkSheet): RawRow[] {
  const matrix = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
    header: 1,
    defval: '',
  });
  if (matrix.length < 2) return [];

  const records: RawRow[] = [];
  let lastParent = '';
  let lastSubParent = '';

  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i];
    const c0 = String(row[0] ?? '').trim();
    const c1 = String(row[1] ?? '').trim();
    const taxonomy = String(row[2] ?? '').trim();
    const description = String(row[3] ?? '').trim();

    if (c0) lastParent = c0;
    if (c1) lastSubParent = c1;

    if (!taxonomy) continue;

    records.push({
      parent: lastParent,
      subParent: lastSubParent,
      taxonomy,
      description,
    });
  }

  return records;
}

function inferSportsLeague(pathParts: string[]): string | null {
  for (const league of LEAGUES) {
    if (pathParts.includes(league)) return league;
  }
  return null;
}

function rowToInsert(row: RawRow): Record<string, unknown> | null {
  const name = row.taxonomy.trim();
  if (!name) return null;

  if (!TAXONOMY_SEGMENTS_RE.test(name)) {
    console.warn(`[skip] taxonomy fails depth check: ${name.slice(0, 80)}…`);
    return null;
  }

  const pathParts = name.split('>').map((p) => p.trim());
  const tags = pathParts.slice(0, -1);
  const display_name = pathParts[pathParts.length - 1] || name;
  const category = row.parent || pathParts[0] || 'General';
  const description = row.description.trim() || display_name;
  const sports_league = inferSportsLeague(pathParts);

  return {
    name,
    display_name,
    description,
    category,
    tags,
    sports_league,
    is_featured: false,
  };
}

async function main() {
  const { dryRun, execute, backupDir, xlsxPath } = parseArgs();

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

  if (!fs.existsSync(xlsxPath)) {
    console.error(`File not found: ${xlsxPath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(xlsxPath);
  const allRaw: RawRow[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const part = sheetRowsToRecords(sheet);
    console.log(`Sheet "${sheetName}": ${part.length} data rows`);
    allRaw.push(...part);
  }

  const seen = new Set<string>();
  const inserts: Record<string, unknown>[] = [];

  for (const raw of allRaw) {
    const row = rowToInsert(raw);
    if (!row) continue;
    const name = row.name as string;
    if (seen.has(name)) continue;
    seen.add(name);
    inserts.push(row);
  }

  console.log(`Unique valid audiences: ${inserts.length}`);

  if (dryRun) {
    console.log('Sample (first 3):');
    console.log(JSON.stringify(inserts.slice(0, 3), null, 2));
    process.exit(0);
  }

  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (backupDir) {
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const selectCols =
      'id, name, display_name, description, category, tags, is_featured, sports_league, created_at, updated_at';
    const existing: Record<string, unknown>[] = [];
    let from = 0;
    for (;;) {
      const { data: page, error: fetchErr } = await supabase
        .from('audiences')
        .select(selectCols)
        .order('id', { ascending: true })
        .range(from, from + BACKUP_PAGE_SIZE - 1);

      if (fetchErr) {
        console.error('Backup fetch failed:', fetchErr);
        process.exit(1);
      }
      const chunk = page ?? [];
      existing.push(...chunk);
      if (chunk.length < BACKUP_PAGE_SIZE) break;
      from += BACKUP_PAGE_SIZE;
    }

    const backupPath = path.join(backupDir, `audiences-backup-${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2), 'utf-8');
    console.log(`Wrote backup: ${backupPath} (${existing.length} rows)`);
  }

  const { error: delErr } = await supabase
    .from('audiences')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (delErr) {
    console.error('Delete failed:', delErr);
    process.exit(1);
  }
  console.log('Deleted existing audiences.');

  for (let i = 0; i < inserts.length; i += BATCH_SIZE) {
    const chunk = inserts.slice(i, i + BATCH_SIZE);
    const { error: insErr } = await supabase.from('audiences').insert(chunk);
    if (insErr) {
      console.error(`Insert failed at batch ${i}:`, insErr);
      process.exit(1);
    }
    console.log(`Inserted ${Math.min(i + BATCH_SIZE, inserts.length)} / ${inserts.length}`);
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

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
