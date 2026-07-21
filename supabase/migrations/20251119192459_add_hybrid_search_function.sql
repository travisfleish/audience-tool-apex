/*
  # Add Hybrid Search Function

  1. New Extensions
    - Enable `pg_trgm` for fuzzy text matching (trigram similarity)
  
  2. New Function
    - `hybrid_semantic_search` - Combines semantic similarity with keyword/fuzzy matching
    - Parameters:
      - query_text: The original search query for keyword matching
      - query_embedding: Pre-computed embedding for semantic search
      - match_threshold: Minimum similarity score (default 0.3, lower for hybrid)
      - match_count: Maximum results to return (default 10)
    
  3. Scoring Logic
    - Base score from semantic similarity (0-1)
    - Boost +0.5 for exact match in display_name (case-insensitive)
    - Boost +0.3 for partial match in display_name
    - Boost +0.2 for match in hierarchical_context
    - Boost +0.1 for high trigram similarity (>0.5) in display_name
    - Results sorted by final combined score
  
  4. Purpose
    - Ensure queries like "taylor swift" return "NFL Swifties" at the top
    - Balance semantic understanding with exact keyword matching
    - Provide more intuitive search results
*/

-- Enable trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS hybrid_semantic_search(text, vector, float, int);

-- Create hybrid search function
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
      ) AS keyword_boost
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
    (sr.similarity + sr.keyword_boost) AS final_score
  FROM scored_results sr
  WHERE (sr.similarity + sr.keyword_boost) >= match_threshold
  ORDER BY final_score DESC, sr.similarity DESC
  LIMIT match_count;
END;
$$;