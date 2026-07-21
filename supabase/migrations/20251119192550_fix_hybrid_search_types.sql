/*
  # Fix Hybrid Search Type Mismatch

  1. Changes
    - Fix return type for keyword_boost and final_score columns
    - Cast numeric CASE expressions to float to match expected return type
  
  2. Purpose
    - Resolve PostgreSQL type mismatch error (numeric vs double precision)
*/

DROP FUNCTION IF EXISTS hybrid_semantic_search(text, vector, float, int);

CREATE OR REPLACE FUNCTION hybrid_semantic_search(
  query_text text,
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  display_name text,
  hierarchical_context text,
  description text,
  sports_league text,
  category text,
  similarity float,
  keyword_boost float,
  final_score float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH semantic_results AS (
    SELECT
      a.id,
      a.name,
      a.display_name,
      a.hierarchical_context,
      a.description,
      a.sports_league,
      a.category,
      1 - (a.hierarchical_context_embedding <=> query_embedding) AS similarity
    FROM audiences a
    WHERE a.hierarchical_context_embedding IS NOT NULL
  ),
  scored_results AS (
    SELECT
      sr.*,
      (
        -- Exact match in display_name (case-insensitive)
        CASE WHEN LOWER(sr.display_name) = LOWER(query_text) THEN 0.5
        -- Partial match in display_name (case-insensitive)
        WHEN LOWER(sr.display_name) LIKE '%' || LOWER(query_text) || '%' THEN 0.3
        ELSE 0.0 END
        +
        -- Match in hierarchical_context (case-insensitive)
        CASE WHEN LOWER(sr.hierarchical_context) LIKE '%' || LOWER(query_text) || '%' THEN 0.2
        ELSE 0.0 END
        +
        -- Trigram similarity boost for fuzzy matching
        CASE WHEN similarity(LOWER(sr.display_name), LOWER(query_text)) > 0.5 THEN 0.1
        ELSE 0.0 END
      )::float AS keyword_boost
    FROM semantic_results sr
  )
  SELECT
    sr.id,
    sr.name,
    sr.display_name,
    sr.hierarchical_context,
    sr.description,
    sr.sports_league,
    sr.category,
    sr.similarity,
    sr.keyword_boost,
    (sr.similarity + sr.keyword_boost)::float AS final_score
  FROM scored_results sr
  WHERE (sr.similarity + sr.keyword_boost) >= match_threshold
  ORDER BY final_score DESC, sr.similarity DESC
  LIMIT match_count;
END;
$$;