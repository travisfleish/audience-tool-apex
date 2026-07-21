/*
  # Drop old hybrid_semantic_search overload

  1. Changes
    - Drops the old 4-parameter overload (with match_threshold) that conflicts
      with the new 3-parameter version via PostgREST function resolution

  2. Rationale
    - PostgREST returns HTTP 300 when it cannot disambiguate between overloads
      with overlapping default parameters
    - The old overload is superseded by the new exact-scan version
*/

DROP FUNCTION IF EXISTS public.hybrid_semantic_search(text, vector, double precision, integer);
