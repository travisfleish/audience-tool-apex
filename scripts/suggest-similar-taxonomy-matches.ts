/**
 * For audiences in DB but not in the taxonomy Excel (exact path), finds the closest
 * Taxonomy strings in the workbook using normalized edit distance + leaf/prefix signals.
 *
 * Usage:
 *   npx tsx scripts/suggest-similar-taxonomy-matches.ts [input.csv] [taxonomy.xlsx] [output.csv]
 *
 * Defaults:
 *   input:   backend-audiences-not-in-taxonomy-bank.csv
 *   xlsx:    data/EXTERNAL - GENIUS N RIL TAXONOMY BANK.xlsx
 *   output:  data/backend-audiences-not-in-taxonomy-bank-similar-matches.csv
 */

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const DEFAULT_IN = 'data/backend-audiences-not-in-taxonomy-bank.csv';
const DEFAULT_XLSX = 'data/EXTERNAL - GENIUS N RIL TAXONOMY BANK.xlsx';
const DEFAULT_OUT = 'data/backend-audiences-not-in-taxonomy-bank-similar-matches.csv';

function normalizeTaxonomy(s: string): string {
  let t = s.trim();
  t = t.replace(/\s*>\s*/g, ' > ');
  t = t.replace(/\s+/g, ' ');
  return t.trim();
}

/** Collapse wording variants so Gen Z (18+) lines up with Gen Z. */
function canonicalForCompare(s: string): string {
  let t = normalizeTaxonomy(s);
  t = t.replace(/\bGen Z\s*\(\s*18\+\s*\)/gi, 'Gen Z');
  t = t.replace(/\s*\(\s*FOWS\s*\)/gi, '');
  t = t.replace(/\s+/g, ' ');
  return t.trim();
}

function splitPath(s: string): string[] {
  return normalizeTaxonomy(s)
    .split(' > ')
    .map((p) => p.trim())
    .filter(Boolean);
}

function lastSegment(s: string): string {
  const p = splitPath(s);
  return p[p.length - 1] ?? '';
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + c);
    }
  }
  return dp[m][n];
}

function ratio(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  const d = levenshtein(a, b);
  return 1 - d / Math.max(a.length, b.length, 1);
}

/** Shared prefix segment count (case-insensitive, canonical per segment). */
function prefixOverlapScore(db: string, excel: string): number {
  const A = splitPath(db).map((x) => canonicalForCompare(x).toLowerCase());
  const B = splitPath(excel).map((x) => canonicalForCompare(x).toLowerCase());
  const maxL = Math.max(A.length, B.length);
  if (maxL === 0) return 0;
  let i = 0;
  while (i < A.length && i < B.length && A[i] === B[i]) i++;
  return i / maxL;
}

function combinedScore(dbName: string, excelPath: string): number {
  const cDb = canonicalForCompare(dbName);
  const cEx = canonicalForCompare(excelPath);
  const full = ratio(cDb.toLowerCase(), cEx.toLowerCase());
  const leaf = ratio(
    canonicalForCompare(lastSegment(dbName)).toLowerCase(),
    canonicalForCompare(lastSegment(excelPath)).toLowerCase()
  );
  const prefix = prefixOverlapScore(dbName, excelPath);
  // Weight leaf heavily when taxonomy re-parents (same audience leaf, different branch).
  return 0.32 * full + 0.38 * leaf + 0.3 * prefix;
}

function loadTaxonomyPaths(xlsxPath: string): string[] {
  const abs = path.isAbsolute(xlsxPath) ? xlsxPath : path.join(process.cwd(), xlsxPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Excel file not found: ${abs}`);
  }
  const buf = fs.readFileSync(abs);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const paths: string[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
      header: 1,
      defval: undefined,
      raw: false,
    }) as unknown[][];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as unknown[];
      const cell = row?.[2];
      if (cell === undefined || cell === null || cell === '') continue;
      const n = normalizeTaxonomy(String(cell));
      if (n) paths.push(n);
    }
  }
  return paths;
}

function csvEscape(field: string): string {
  if (/[",\n\r]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

interface Row {
  id: string;
  name: string;
  display_name: string;
  category: string;
  sports_league: string;
}

function loadMissingCsv(csvPath: string): Row[] {
  const abs = path.isAbsolute(csvPath) ? csvPath : path.join(process.cwd(), csvPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`CSV not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, string>[];
  return records.map((r) => ({
    id: r.id ?? '',
    name: r.name ?? '',
    display_name: r.display_name ?? '',
    category: r.category ?? '',
    sports_league: r.sports_league ?? '',
  }));
}

function topMatches(
  dbName: string,
  excelPaths: string[],
  k: number
): { path: string; score: number }[] {
  const scored = excelPaths.map((p) => ({
    path: p,
    score: combinedScore(dbName, p),
  }));
  scored.sort((a, b) => b.score - a.score);
  const out: { path: string; score: number }[] = [];
  const seen = new Set<string>();
  for (const s of scored) {
    if (seen.has(s.path)) continue;
    seen.add(s.path);
    out.push({ path: s.path, score: s.score });
    if (out.length >= k) break;
  }
  return out;
}

async function main() {
  const inPath = process.argv[2] ?? DEFAULT_IN;
  const xlsxPath = process.argv[3] ?? DEFAULT_XLSX;
  const outPath = process.argv[4] ?? DEFAULT_OUT;

  console.log(`Loading Excel: ${xlsxPath}`);
  const excelPaths = loadTaxonomyPaths(xlsxPath);
  console.log(`  Taxonomy rows: ${excelPaths.length} (unique: ${new Set(excelPaths).size})`);

  console.log(`Loading CSV: ${inPath}`);
  const rows = loadMissingCsv(inPath);
  console.log(`  Rows: ${rows.length}`);

  const K = 5;
  const header = [
    'id',
    'database_name',
    'display_name',
    'category',
    'sports_league',
    ...Array.from({ length: K }, (_, i) => [`excel_match_${i + 1}`, `excel_match_${i + 1}_score`]).flat(),
  ];

  const lines: string[] = [header.join(',')];

  for (const row of rows) {
    const tops = topMatches(row.name, excelPaths, K);
    const scoresPct = tops.map((t) => Math.round(t.score * 1000) / 10);
    const cells = [
      row.id,
      csvEscape(row.name),
      csvEscape(row.display_name),
      csvEscape(row.category),
      row.sports_league ? csvEscape(row.sports_league) : '',
    ];
    for (let i = 0; i < K; i++) {
      if (tops[i]) {
        cells.push(csvEscape(tops[i].path), String(scoresPct[i]));
      } else {
        cells.push('', '');
      }
    }
    lines.push(cells.join(','));
  }

  const absOut = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
  fs.writeFileSync(absOut, lines.join('\n') + '\n', 'utf-8');
  console.log(`Wrote ${absOut}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
