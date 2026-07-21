alter table public.embedding_request_metrics
  add column if not exists search_term text,
  add column if not exists cache_term text;

create index if not exists idx_erm_search_term
  on public.embedding_request_metrics (search_term);
