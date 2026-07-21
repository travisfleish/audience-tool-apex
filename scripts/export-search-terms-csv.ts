import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

type SearchLogRow = {
  query: string;
  expanded_query: string | null;
  created_at: string;
};

type ExportOptions = {
  fromIso: string;
  toIso: string;
  outputPath: string;
  limit: number;
};

function decodeJwtRole(jwt: string): string | null {
  const parts = jwt.split('.');
  if (parts.length < 2) return null;
  try {
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson) as { role?: unknown };
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

function maskSupabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '[invalid-url]';
  }
}

function printUsage(): void {
  console.log(`
Usage:
  npm run export-search-terms -- [options]

Options:
  --days=30                      Export trailing N days (default: 30)
  --from=2026-02-01              Inclusive start date/time (ISO/date)
  --to=2026-02-25                Inclusive end date/time (ISO/date)
  --limit=5000                   Max rows to scan before aggregation
  --output=search-terms-report.csv
  --all                          Export full history (overrides --days)
  --help                         Show this help
`);
}

function parseDateInput(input: string, fieldName: string): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName} date: ${input}`);
  }
  return parsed.toISOString();
}

function parseArgs(argv: string[]): ExportOptions {
  const argMap = new Map<string, string | boolean>();

  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, value] = arg.slice(2).split('=', 2);
    if (!key) continue;
    argMap.set(key, value ?? true);
  }

  const now = new Date();
  const hasAll = argMap.has('all');
  const daysArg = Number(argMap.get('days') ?? '30');
  const days = Number.isFinite(daysArg) && daysArg > 0 ? daysArg : 30;

  const defaultFrom = new Date(now);
  defaultFrom.setDate(now.getDate() - days);

  const fromArg = typeof argMap.get('from') === 'string' ? String(argMap.get('from')) : null;
  const toArg = typeof argMap.get('to') === 'string' ? String(argMap.get('to')) : null;
  const outputPath = typeof argMap.get('output') === 'string'
    ? String(argMap.get('output'))
    : 'data/search-terms-report.csv';

  const limitArg = Number(argMap.get('limit') ?? '5000');
  const limit = Number.isFinite(limitArg) && limitArg > 0
    ? Math.min(Math.floor(limitArg), 100000)
    : 5000;

  const fromIso = hasAll
    ? '1970-01-01T00:00:00.000Z'
    : parseDateInput(fromArg ?? defaultFrom.toISOString(), '--from');
  const toIso = parseDateInput(toArg ?? now.toISOString(), '--to');

  if (new Date(fromIso) > new Date(toIso)) {
    throw new Error('--from must be earlier than --to.');
  }

  return {
    fromIso,
    toIso,
    outputPath,
    limit,
  };
}

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return 'query,expanded_query,search_count,first_seen,last_seen\n';

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];

  for (const row of rows) {
    const values = headers.map((header) => escapeCsvCell(String(row[header] ?? '')));
    lines.push(values.join(','));
  }

  return `${lines.join('\n')}\n`;
}

async function fetchSearchLogs(options: ExportOptions): Promise<SearchLogRow[]> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) in environment.');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment.');
  }

  const tokenRole = decodeJwtRole(serviceRoleKey);
  if (tokenRole !== 'service_role') {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY is not a service_role token (detected role: ${tokenRole ?? 'unknown'}). ` +
      'Please set the actual service_role key so this export can read protected tables.'
    );
  }

  console.log(`- Supabase project: ${maskSupabaseUrl(supabaseUrl)}`);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const pageSize = 1000;
  const allRows: SearchLogRow[] = [];
  let from = 0;

  while (allRows.length < options.limit) {
    const to = Math.min(from + pageSize - 1, options.limit - 1);

    const { data, error } = await supabase
      .from('search_logs')
      .select('query, expanded_query, created_at')
      .gte('created_at', options.fromIso)
      .lte('created_at', options.toIso)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch search logs: ${error.message}`);
    }

    const pageRows = (data ?? []) as SearchLogRow[];
    allRows.push(...pageRows);

    if (pageRows.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

function buildSummaryRows(rows: SearchLogRow[]): Array<Record<string, string | number>> {
  const aggregate = new Map<string, {
    query: string;
    expandedQuery: string;
    count: number;
    firstSeen: string;
    lastSeen: string;
  }>();

  for (const row of rows) {
    const query = (row.query || '').trim();
    if (!query) continue;
    const expandedQuery = (row.expanded_query || '').trim();
    const key = `${query}|||${expandedQuery}`;
    const createdAt = row.created_at;

    const existing = aggregate.get(key);
    if (!existing) {
      aggregate.set(key, {
        query,
        expandedQuery,
        count: 1,
        firstSeen: createdAt,
        lastSeen: createdAt,
      });
      continue;
    }

    existing.count += 1;
    if (createdAt < existing.firstSeen) existing.firstSeen = createdAt;
    if (createdAt > existing.lastSeen) existing.lastSeen = createdAt;
  }

  return Array.from(aggregate.values())
    .sort((a, b) => b.count - a.count || a.query.localeCompare(b.query))
    .map((row) => ({
      query: row.query,
      expanded_query: row.expandedQuery,
      search_count: row.count,
      first_seen: row.firstSeen,
      last_seen: row.lastSeen,
    }));
}

async function run(): Promise<void> {
  if (process.argv.includes('--help')) {
    printUsage();
    return;
  }

  const options = parseArgs(process.argv.slice(2));

  console.log('Exporting search terms report...');
  console.log(`- Date range: ${options.fromIso} -> ${options.toIso}`);
  console.log(`- Row limit: ${options.limit}`);

  const rows = await fetchSearchLogs(options);
  const summaryRows = buildSummaryRows(rows);
  const csv = toCsv(summaryRows);

  fs.writeFileSync(options.outputPath, csv, 'utf-8');

  console.log(`\nExport complete: ${options.outputPath}`);
  console.log(`- Source rows scanned: ${rows.length}`);
  console.log(`- Unique query variants exported: ${summaryRows.length}`);
}

run().catch((error) => {
  console.error('Fatal error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
