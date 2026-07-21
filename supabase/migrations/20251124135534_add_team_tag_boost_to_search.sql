/*
  # Add team tag boost to hybrid search

  1. Changes
    - Update hybrid_semantic_search function to boost results with 'team' tag
    - When query contains "team", "teams", or league names followed by "teams", boost team audiences
    - Team tag boost adds 0.4 to the final score for team audiences matching team-related queries

  2. Purpose
    - Improve search results for queries like "nba teams", "nfl teams", etc.
    - Ensure actual team audiences surface first when users search for teams
    - Support queries like "teams", "nba teams", "mlb teams", etc.
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
  tags text[],
  is_featured boolean,
  created_at timestamptz,
  updated_at timestamptz,
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
      a.tags,
      a.is_featured,
      a.created_at,
      a.updated_at,
      1 - (a.hierarchical_context_embedding <=> query_embedding) AS similarity
    FROM audiences a
    WHERE a.hierarchical_context_embedding IS NOT NULL
  ),
  scored_results AS (
    SELECT
      sr.*,
      (
        -- Exact match in display_name (case-insensitive) - highest boost
        CASE WHEN LOWER(sr.display_name) = LOWER(query_text) THEN 0.5
        -- Partial match in display_name (case-insensitive)
        WHEN LOWER(sr.display_name) LIKE '%' || LOWER(query_text) || '%' THEN 0.3
        ELSE 0.0 END
        +
        -- Match in description (case-insensitive)
        CASE WHEN LOWER(sr.description) LIKE '%' || LOWER(query_text) || '%' THEN 0.25
        ELSE 0.0 END
        +
        -- Match in hierarchical_context (case-insensitive)
        CASE WHEN LOWER(sr.hierarchical_context) LIKE '%' || LOWER(query_text) || '%' THEN 0.2
        ELSE 0.0 END
        +
        -- Trigram similarity boost for fuzzy matching
        CASE WHEN similarity(LOWER(sr.display_name), LOWER(query_text)) > 0.5 THEN 0.1
        ELSE 0.0 END
        +
        -- Team tag boost when query contains team-related keywords
        CASE 
          WHEN 'team' = ANY(sr.tags) AND (
            LOWER(query_text) LIKE '%team%' OR
            LOWER(query_text) LIKE '%nba%' AND LOWER(query_text) LIKE '%team%' OR
            LOWER(query_text) LIKE '%nfl%' AND LOWER(query_text) LIKE '%team%' OR
            LOWER(query_text) LIKE '%mlb%' AND LOWER(query_text) LIKE '%team%' OR
            LOWER(query_text) LIKE '%nhl%' AND LOWER(query_text) LIKE '%team%' OR
            LOWER(query_text) LIKE '%mls%' AND LOWER(query_text) LIKE '%team%' OR
            LOWER(query_text) LIKE '%wnba%' AND LOWER(query_text) LIKE '%team%' OR
            LOWER(query_text) LIKE '%nwsl%' AND LOWER(query_text) LIKE '%team%'
          ) THEN 0.4
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
    sr.tags,
    sr.is_featured,
    sr.created_at,
    sr.updated_at,
    sr.similarity,
    sr.keyword_boost,
    (sr.similarity + sr.keyword_boost)::float AS final_score
  FROM scored_results sr
  WHERE (sr.similarity + sr.keyword_boost) >= match_threshold
  ORDER BY final_score DESC, sr.similarity DESC
  LIMIT match_count;
END;
$$;
