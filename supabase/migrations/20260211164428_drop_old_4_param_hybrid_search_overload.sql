/*
  # Drop Old 4-Parameter Hybrid Search Overload

  1. Changes
    - Drops the old hybrid_semantic_search(text, vector, integer, double precision)
    - Only the new 5-parameter version (with raw_query_text) remains

  2. Rationale
    - PostgreSQL treats functions with different parameter counts as separate overloads
    - PostgREST returns HTTP 300 when it cannot disambiguate between overloads
    - Dropping the old signature resolves the ambiguity
    - Frontend must be updated to pass raw_query_text before this migration runs
*/

DROP FUNCTION IF EXISTS public.hybrid_semantic_search(text, vector, integer, double precision);
