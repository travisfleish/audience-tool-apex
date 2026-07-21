/*
  # Lock Down Internal Cache/Rate-Limit Tables

  1. Changes
    - Enables RLS on internal operational tables:
      - query_embedding_cache
      - embedding_request_metrics
      - rate_limit_counters
    - Revokes direct table privileges from anon/authenticated/public
    - Restricts RPC execution for internal helper functions to service_role only

  2. Rationale
    - These tables/functions are internal infrastructure for edge functions
    - They should not be directly accessible from client roles
*/

alter table if exists public.query_embedding_cache enable row level security;
alter table if exists public.embedding_request_metrics enable row level security;
alter table if exists public.rate_limit_counters enable row level security;

revoke all on table public.query_embedding_cache from public, anon, authenticated;
revoke all on table public.embedding_request_metrics from public, anon, authenticated;
revoke all on table public.rate_limit_counters from public, anon, authenticated;

revoke all on function public.increment_rate_limit_counter(text, timestamptz) from public, anon, authenticated;
revoke all on function public.touch_query_embedding_cache(char) from public, anon, authenticated;

grant execute on function public.increment_rate_limit_counter(text, timestamptz) to service_role;
grant execute on function public.touch_query_embedding_cache(char) to service_role;
