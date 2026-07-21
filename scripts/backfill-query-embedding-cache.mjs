import 'dotenv/config';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const applyChanges = process.argv.includes('--apply');
const pageSize = 1000;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ');
}

function buildCacheKey(row, canonicalInput) {
  const payload = [
    row.model_name,
    String(row.dimensions),
    row.preprocess_version,
    row.intent_catalog_version,
    canonicalInput,
  ].join(':');
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pickMostRecent(a, b) {
  const aLast = Date.parse(a.last_accessed_at || a.created_at || 0);
  const bLast = Date.parse(b.last_accessed_at || b.created_at || 0);
  return aLast >= bLast ? a : b;
}

async function readAllRows() {
  let from = 0;
  const rows = [];
  while (true) {
    const { data, error } = await supabase
      .from('query_embedding_cache')
      .select('*')
      .order('cache_key', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

async function main() {
  const rows = await readAllRows();

  const byNewKey = new Map();
  const oldKeysToDelete = [];

  for (const row of rows) {
    const canonicalInput = normalize(row.canonical_input);
    const newKey = buildCacheKey(row, canonicalInput);

    if (newKey !== row.cache_key) oldKeysToDelete.push(row.cache_key);

    const next = {
      cache_key: newKey,
      namespace: row.namespace,
      canonical_input: canonicalInput,
      model_name: row.model_name,
      dimensions: row.dimensions,
      preprocess_version: row.preprocess_version,
      intent_catalog_version: row.intent_catalog_version,
      embedding: row.embedding,
      created_at: row.created_at,
      last_accessed_at: row.last_accessed_at,
      hit_count: row.hit_count ?? 0,
    };

    const existing = byNewKey.get(newKey);
    if (!existing) {
      byNewKey.set(newKey, next);
      continue;
    }

    const newer = pickMostRecent(existing, next);
    byNewKey.set(newKey, {
      ...newer,
      cache_key: newKey,
      namespace: newer.namespace,
      canonical_input: canonicalInput,
      model_name: newer.model_name,
      dimensions: newer.dimensions,
      preprocess_version: newer.preprocess_version,
      intent_catalog_version: newer.intent_catalog_version,
      embedding: newer.embedding,
      created_at: (Date.parse(existing.created_at) <= Date.parse(next.created_at))
        ? existing.created_at
        : next.created_at,
      last_accessed_at: (Date.parse(existing.last_accessed_at) >= Date.parse(next.last_accessed_at))
        ? existing.last_accessed_at
        : next.last_accessed_at,
      hit_count: Number(existing.hit_count || 0) + Number(next.hit_count || 0),
    });
  }

  const upsertRows = [...byNewKey.values()];
  const uniqueDeletes = [...new Set(oldKeysToDelete)];

  console.log(JSON.stringify({
    mode: applyChanges ? 'apply' : 'dry-run',
    originalRows: rows.length,
    canonicalRows: upsertRows.length,
    keysToDelete: uniqueDeletes.length,
  }, null, 2));

  if (!applyChanges) {
    console.log('Dry-run only. Re-run with --apply to write changes.');
    return;
  }

  for (const rowsChunk of chunk(upsertRows, 500)) {
    const { error } = await supabase
      .from('query_embedding_cache')
      .upsert(rowsChunk, { onConflict: 'cache_key' });
    if (error) throw error;
  }

  for (const keysChunk of chunk(uniqueDeletes, 500)) {
    const { error } = await supabase
      .from('query_embedding_cache')
      .delete()
      .in('cache_key', keysChunk);
    if (error) throw error;
  }

  console.log('Backfill complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
