import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

type ExportOptions = {
  schema: string;
  table: string;
  columns: string;
  outputPath: string;
  outputDir: string;
  limit: number;
  pageSize: number;
  orderBy?: string;
  ascending: boolean;
  fromIso?: string;
  toIso?: string;
  dateColumn?: string;
};

type Row = Record<string, unknown>;

function printUsage(): void {
  console.log(`
Usage:
  npm run export-table-csv -- --table=search_logs [options]

Required:
  --table=TABLE_NAME                 Table name in selected schema

Options:
  --schema=public                    Schema name (default: public)
  --columns=id,created_at,query      Comma-separated column list (default: *)
  --output=table-export.csv          Output file name/path (default: date-stamped file in exports/<table>/)
  --output-dir=exports               Base output directory for table exports
  --limit=5000                       Max rows to export (default: 5000, max: 100000)
  --page-size=1000                   Rows per page (default: 1000, max: 5000)
  --order-by=created_at              Column to sort by (optional)
  --ascending                        Sort ascending (default: descending if order-by set)
  --date-column=created_at           Date/timestamp column for range filters
  --from=2026-02-01                  Inclusive start date/time (requires --date-column)
  --to=2026-02-25                    Inclusive end date/time (requires --date-column)
  --help                             Show this help

Examples:
  npm run export-table-csv -- --table=search_logs --columns=query,expanded_query,created_at --order-by=created_at
  npm run export-table-csv -- --table=activation_requests --limit=1000
  npm run export-table-csv -- --table=search_logs --date-column=created_at --from=2026-02-01 --to=2026-02-25
`);
}

function parseDateInput(input: string, fieldName: string): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName} date: ${input}`);
  }
  return parsed.toISOString();
}

function formatSortableTimestamp(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const sec = String(date.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${sec}`;
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

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

function parseArgs(argv: string[]): ExportOptions {
  const argMap = new Map<string, string | boolean>();

  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, value] = arg.slice(2).split('=', 2);
    if (!key) continue;
    argMap.set(key, value ?? true);
  }

  const table = typeof argMap.get('table') === 'string' ? String(argMap.get('table')).trim() : '';
  if (!table) {
    throw new Error('Missing required --table argument.');
  }

  const schema = typeof argMap.get('schema') === 'string' ? String(argMap.get('schema')).trim() : 'public';
  const columns = typeof argMap.get('columns') === 'string' ? String(argMap.get('columns')).trim() : '*';
  const outputArg = typeof argMap.get('output') === 'string' ? String(argMap.get('output')).trim() : '';
  const outputDirArg = typeof argMap.get('output-dir') === 'string' ? String(argMap.get('output-dir')).trim() : '';
  const outputDir = outputDirArg || 'exports';
  const tableDir = path.join(outputDir, sanitizePathSegment(table));
  const timestamp = formatSortableTimestamp(new Date());
  const defaultFileName = `${timestamp}_${sanitizePathSegment(table)}.csv`;

  let outputPath: string;
  if (!outputArg) {
    outputPath = path.join(tableDir, defaultFileName);
  } else if (path.isAbsolute(outputArg)) {
    outputPath = outputArg;
  } else {
    outputPath = path.join(tableDir, outputArg);
  }

  const limitArg = Number(argMap.get('limit') ?? '5000');
  const limit = Number.isFinite(limitArg) && limitArg > 0
    ? Math.min(Math.floor(limitArg), 100000)
    : 5000;

  const pageSizeArg = Number(argMap.get('page-size') ?? '1000');
  const pageSize = Number.isFinite(pageSizeArg) && pageSizeArg > 0
    ? Math.min(Math.floor(pageSizeArg), 5000)
    : 1000;

  const orderBy = typeof argMap.get('order-by') === 'string' ? String(argMap.get('order-by')).trim() : undefined;
  const ascending = argMap.has('ascending');

  const dateColumn = typeof argMap.get('date-column') === 'string'
    ? String(argMap.get('date-column')).trim()
    : undefined;
  const fromArg = typeof argMap.get('from') === 'string' ? String(argMap.get('from')) : undefined;
  const toArg = typeof argMap.get('to') === 'string' ? String(argMap.get('to')) : undefined;

  if ((fromArg || toArg) && !dateColumn) {
    throw new Error('Use --date-column when providing --from/--to.');
  }

  const fromIso = fromArg ? parseDateInput(fromArg, '--from') : undefined;
  const toIso = toArg ? parseDateInput(toArg, '--to') : undefined;
  if (fromIso && toIso && new Date(fromIso) > new Date(toIso)) {
    throw new Error('--from must be earlier than --to.');
  }

  return {
    schema,
    table,
    columns,
    outputPath,
    outputDir,
    limit,
    pageSize,
    orderBy,
    ascending,
    fromIso,
    toIso,
    dateColumn,
  };
}

function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(rows: Row[]): string {
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  if (headers.length === 0) return '\n';

  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map((header) => escapeCsvCell(normalizeCell(row[header])));
    lines.push(values.join(','));
  }
  return `${lines.join('\n')}\n`;
}

async function fetchRows(options: ExportOptions): Promise<Row[]> {
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
      `SUPABASE_SERVICE_ROLE_KEY is not a service_role token (detected role: ${tokenRole ?? 'unknown'}).`
    );
  }

  console.log(`- Supabase project: ${maskSupabaseUrl(supabaseUrl)}`);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const allRows: Row[] = [];
  let from = 0;

  while (allRows.length < options.limit) {
    const to = Math.min(from + options.pageSize - 1, options.limit - 1);

    let query = supabase
      .schema(options.schema)
      .from(options.table)
      .select(options.columns)
      .range(from, to);

    if (options.dateColumn && options.fromIso) {
      query = query.gte(options.dateColumn, options.fromIso);
    }
    if (options.dateColumn && options.toIso) {
      query = query.lte(options.dateColumn, options.toIso);
    }
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending });
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch ${options.schema}.${options.table}: ${error.message}`);
    }

    const pageRows = (data ?? []) as Row[];
    allRows.push(...pageRows);

    if (pageRows.length < options.pageSize) break;
    from += options.pageSize;
  }

  return allRows;
}

async function run(): Promise<void> {
  if (process.argv.includes('--help')) {
    printUsage();
    return;
  }

  const options = parseArgs(process.argv.slice(2));

  console.log(`Exporting ${options.schema}.${options.table} to CSV...`);
  console.log(`- Columns: ${options.columns}`);
  console.log(`- Output: ${options.outputPath}`);
  console.log(`- Output directory: ${options.outputDir}`);
  console.log(`- Limit: ${options.limit}`);
  if (options.orderBy) {
    console.log(`- Order: ${options.orderBy} (${options.ascending ? 'asc' : 'desc'})`);
  }
  if (options.dateColumn) {
    console.log(
      `- Date filter (${options.dateColumn}): ${options.fromIso ?? '[none]'} -> ${options.toIso ?? '[none]'}`
    );
  }

  const rows = await fetchRows(options);
  const csv = toCsv(rows);
  fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
  fs.writeFileSync(options.outputPath, csv, 'utf-8');

  console.log(`\nExport complete: ${options.outputPath}`);
  console.log(`- Rows exported: ${rows.length}`);
}

run().catch((error) => {
  console.error('Fatal error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
