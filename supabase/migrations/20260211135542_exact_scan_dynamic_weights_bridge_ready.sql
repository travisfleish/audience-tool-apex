/*
  # Exact Scan + Dynamic Weights for Hybrid Search

  With only ~1300 rows, ANN (IVFFlat) adds complexity and hurts recall
  without meaningful performance benefit. This migration:

  1. Changes
    - Replaces ANN candidate pool (LIMIT 500) with exact full-table scan
    - Adds dynamic weight blending based on query token count:
      - Short queries (1-2 tokens): 0.65 semantic + 0.35 lexical
      - Longer queries (3+ tokens): 0.80 semantic + 0.20 lexical
    - Adds proper divide-by-zero guard for lexical score normalization
    - Drops the IVFFlat index (no longer needed with exact scan)

  2. Rationale
    - 1300 rows is trivially fast for exact cosine distance ordering
    - IVFFlat can miss best matches on small, noisy datasets
    - Short/broad queries benefit more from lexical matching
    - Exact scan guarantees perfect recall

  3. Important Notes
    - Function signature unchanged: (query_text, query_embedding, match_count)
    - Return columns unchanged
    - Frontend requires zero changes
    - The GIN index on search_vector is kept for FTS acceleration
*/

-- Drop IVFFlat index (no longer needed for exact scan on 1300 rows)
DROP INDEX IF EXISTS idx_hierarchical_context_embedding_ivfflat;

-- Replace hybrid_semantic_search with exact scan + dynamic weights
CREATE OR REPLACE FUNCTION public.hybrid_semantic_search(
  query_text text,
  query_embedding vector,
  match_count integer DEFAULT 50
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
  ts_query := websearch_to_tsquery('english', query_text);

  token_count := array_length(
    string_to_array(trim(regexp_replace(query_text, '\s+', ' ', 'g')), ' '),
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
