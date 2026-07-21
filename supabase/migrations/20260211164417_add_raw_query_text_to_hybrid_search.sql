/*
  # Add raw_query_text Parameter to Hybrid Search

  1. Changes
    - Adds `raw_query_text` parameter to hybrid_semantic_search
    - Token count (for dynamic weight logic) is now computed from `raw_query_text`
      instead of `query_text`
    - Lexical tsquery is now built from `raw_query_text` instead of `query_text`
    - `query_text` parameter is retained but currently unused inside the function
      (kept for forward-compatibility; may be used for expanded lexical strategies later)

  2. Rationale
    - `query_text` was the intent-expanded string (e.g. "nba NBA basketball nba")
    - Token counting on expanded text inflated counts: single-word "nba" became 4 tokens,
      always triggering the 80/20 long-query weight instead of 65/35
    - `websearch_to_tsquery` on expanded text created AND-conjunctions requiring ALL
      expansion terms to match, drastically limiting lexical coverage
    - `raw_query_text` is the original user input, giving accurate token counts and
      precise lexical matching

  3. Weight Logic (unchanged thresholds)
    - 1-2 tokens (from raw_query_text) → w_semantic = 0.65, w_lexical = 0.35
    - 3+  tokens (from raw_query_text) → w_semantic = 0.80, w_lexical = 0.20

  4. Important Notes
    - This creates a NEW 5-parameter overload; the old 4-parameter version must be
      dropped separately to avoid PostgREST HTTP 300 ambiguity
    - Frontend RPC call must be updated to pass raw_query_text
    - Cosine similarity, CTE structure, score threshold, and final_score formula
      are all unchanged
*/

CREATE OR REPLACE FUNCTION public.hybrid_semantic_search(
  query_text text,
  raw_query_text text,
  query_embedding vector,
  match_count integer DEFAULT 50,
  score_threshold double precision DEFAULT 0.15
)
RETURNS TABLE(
  id uuid,
  name text,
  display_name text,
  hierarchical_context text,
  description text,
  sports_league text,
  category text,
  tags text[],
  is_featured boolean,
  created_at timestamptz,
  updated_at timestamptz,
  similarity double precision,
  lexical_score double precision,
  final_score double precision
)
LANGUAGE plpgsql STABLE
AS $function$
DECLARE
  ts_query tsquery;
  token_count integer;
  w_semantic double precision;
  w_lexical double precision;
BEGIN
  ts_query := websearch_to_tsquery('english', raw_query_text);

  token_count := array_length(
    string_to_array(trim(regexp_replace(raw_query_text, '\s+', ' ', 'g')), ' '),
    1
  );

  IF token_count IS NULL OR token_count <= 2 THEN
    w_semantic := 0.65;
    w_lexical := 0.35;
  ELSE
    w_semantic := 0.80;
    w_lexical := 0.20;
  END IF;

  RETURN QUERY
  WITH scored AS (
    SELECT
      a.id,
      a.name,
      a.display_name,
      a.hierarchical_context,
      a.description,
      a.sports_league,
      a.category,
      a.tags,
      a.is_featured,
      a.created_at,
      a.updated_at,
      (1 - (a.hierarchical_context_embedding <=> query_embedding))::double precision AS sim,
      COALESCE(ts_rank_cd(a.search_vector, ts_query), 0)::double precision AS lex
    FROM audiences a
    WHERE a.hierarchical_context_embedding IS NOT NULL
  ),
  max_lex AS (
    SELECT MAX(s.lex) AS raw_max FROM scored s
  )
  SELECT
    s.id,
    s.name,
    s.display_name,
    s.hierarchical_context,
    s.description,
    s.sports_league,
    s.category,
    s.tags,
    s.is_featured,
    s.created_at,
    s.updated_at,
    s.sim AS similarity,
    CASE
      WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
      ELSE (s.lex / ml.raw_max)
    END::double precision AS lexical_score,
    (
      s.sim * w_semantic +
      CASE
        WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
        ELSE (s.lex / ml.raw_max)
      END * w_lexical
    )::double precision AS final_score
  FROM scored s
  CROSS JOIN max_lex ml
  WHERE (
    s.sim * w_semantic +
    CASE
      WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
      ELSE (s.lex / ml.raw_max)
    END * w_lexical
  ) >= score_threshold
  ORDER BY (
    s.sim * w_semantic +
    CASE
      WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
      ELSE (s.lex / ml.raw_max)
    END * w_lexical
  ) DESC
  LIMIT match_count;
END;
$function$;
