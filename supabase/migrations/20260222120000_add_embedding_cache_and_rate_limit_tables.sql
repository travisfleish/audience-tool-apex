create table public.query_embedding_cache (
  cache_key char(64) primary key,
  namespace text not null,
  canonical_input text not null,
  model_name text not null,
  dimensions int not null,
  preprocess_version text not null,
  intent_catalog_version text not null,
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  hit_count bigint not null default 0
);

create index idx_qec_last_accessed_at
  on public.query_embedding_cache (last_accessed_at);

create index idx_qec_model_namespace
  on public.query_embedding_cache (model_name, dimensions, preprocess_version, intent_catalog_version);

create index idx_qec_namespace
  on public.query_embedding_cache (namespace);

create table public.embedding_request_metrics (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  cache_hit boolean not null,
  openai_called boolean not null,
  cache_lookup_ms int not null default 0,
  openai_latency_ms int not null default 0,
  total_embedding_path_ms int not null,
  model_name text not null,
  dimensions int not null,
  preprocess_version text not null,
  intent_catalog_version text not null,
  query_length int not null,
  canonical_input_hash char(64) not null,
  requester_ip text,
  session_id text,
  error_type text
);

create index idx_erm_created_at
  on public.embedding_request_metrics (created_at desc);

create index idx_erm_cache_hit
  on public.embedding_request_metrics (cache_hit, created_at desc);

create table public.rate_limit_counters (
  bucket_key text primary key,
  bucket_start timestamptz not null,
  request_count int not null default 0,
  updated_at timestamptz not null default now()
);

create index idx_rlc_bucket_start
  on public.rate_limit_counters (bucket_start);

create or replace function public.increment_rate_limit_counter(
  p_bucket_key text,
  p_bucket_start timestamptz
)
returns int
language plpgsql
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limit_counters (bucket_key, bucket_start, request_count, updated_at)
  values (p_bucket_key, p_bucket_start, 1, now())
  on conflict (bucket_key)
  do update set
    request_count = public.rate_limit_counters.request_count + 1,
    updated_at = now()
  returning request_count into v_count;

  return v_count;
end;
$$;

create or replace function public.touch_query_embedding_cache(
  p_cache_key char(64)
)
returns void
language sql
set search_path = public
as $$
  update public.query_embedding_cache
  set
    last_accessed_at = now(),
    hit_count = hit_count + 1
  where cache_key = p_cache_key;
$$;
