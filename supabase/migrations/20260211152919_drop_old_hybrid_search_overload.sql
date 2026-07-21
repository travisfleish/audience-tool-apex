/*
  # Drop Old Hybrid Search Overload

  1. Changes
    - Drops the old 3-parameter overload of hybrid_semantic_search(text, vector, integer)
    - Only the new 4-parameter version (with score_threshold) remains
    - Existing callers are unaffected since score_threshold has a default value

  2. Rationale
    - PostgreSQL treats functions with different parameter counts as separate overloads
    - PostgREST returns HTTP 300 when it cannot disambiguate between overloads
    - Dropping the old signature resolves the ambiguity
*/

DROP FUNCTION IF EXISTS public.hybrid_semantic_search(text, vector, integer);