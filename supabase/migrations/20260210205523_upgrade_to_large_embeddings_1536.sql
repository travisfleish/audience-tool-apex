/*
  # Upgrade to text-embedding-3-large with 1536 dimensions

  1. Changes
    - Upgrades all embedding vector columns from 384 to 1536 dimensions
    - Updates model from text-embedding-3-small to text-embedding-3-large
    - Recreates all vector indexes with new dimensions
    - Updates all search functions to use vector(1536)
  
  2. Affected Columns
    - audiences.hierarchical_context_embedding
    - audiences.title_embedding
    - audiences.context_embedding
  
  3. Important Notes
    - This migration will clear all existing embeddings (they need regeneration)
    - All search functions are updated to use the new dimension size
    - Vector indexes are rebuilt with new dimensions
    - The edge function has been updated to use text-embedding-3-large
*/

-- Drop all existing vector indexes
DROP INDEX IF EXISTS idx_hierarchical_context_embedding_ivfflat;
DROP INDEX IF EXISTS idx_audiences_title_embedding;
DROP INDEX IF EXISTS idx_audiences_context_embedding;
DROP INDEX IF EXISTS audiences_embedding_idx;
DROP INDEX IF EXISTS idx_audiences_embedding;

-- Drop existing columns (this will clear all embeddings)
ALTER TABLE audiences DROP COLUMN IF EXISTS hierarchical_context_embedding CASCADE;
ALTER TABLE audiences DROP COLUMN IF EXISTS title_embedding CASCADE;
ALTER TABLE audiences DROP COLUMN IF EXISTS context_embedding CASCADE;

-- Add new columns with 1536 dimensions
ALTER TABLE audiences ADD COLUMN hierarchical_context_embedding vector(1536);
ALTER TABLE audiences ADD COLUMN title_embedding vector(1536);
ALTER TABLE audiences ADD COLUMN context_embedding vector(1536);

-- Recreate vector indexes with new dimensions
CREATE INDEX idx_hierarchical_context_embedding_ivfflat
  ON audiences
  USING ivfflat (hierarchical_context_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_audiences_title_embedding
  ON audiences
  USING ivfflat (title_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_audiences_context_embedding
  ON audiences
  USING ivfflat (context_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Drop and recreate the hybrid search function with new vector dimensions
DROP FUNCTION IF EXISTS search_audiences_hybrid(vector(384), text, text[], integer, numeric);
DROP FUNCTION IF EXISTS search_audiences_hybrid(vector(1536), text, text[], integer, numeric);

CREATE OR REPLACE FUNCTION search_audiences_hybrid(
  query_embedding vector(1536),
  query_text text DEFAULT '',
  categories text[] DEFAULT ARRAY[]::text[],
  match_count integer DEFAULT 50,
  match_threshold numeric DEFAULT 0.4
)
RETURNS TABLE (
  id uuid,
  name text,
  display_name text,
  description text,
  size bigint,
  category text,
  hierarchical_context text,
  similarity numeric,
  rank real
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH semantic_results AS (
    SELECT
      a.id,
      a.name,
      a.display_name,
      a.description,
      a.size,
      a.category,
      a.hierarchical_context,
      1 - (a.hierarchical_context_embedding <=> query_embedding) AS similarity
    FROM audiences a
    WHERE 
      a.hierarchical_context_embedding IS NOT NULL
      AND (array_length(categories, 1) IS NULL OR a.category = ANY(categories))
      AND (1 - (a.hierarchical_context_embedding <=> query_embedding)) >= match_threshold
    ORDER BY a.hierarchical_context_embedding <=> query_embedding
    LIMIT match_count
  ),
  keyword_results AS (
    SELECT
      a.id,
      a.name,
      a.display_name,
      a.description,
      a.size,
      a.category,
      a.hierarchical_context,
      0.0::numeric AS similarity,
      ts_rank_cd(
        setweight(to_tsvector('english', COALESCE(a.display_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(a.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(a.hierarchical_context, '')), 'C'),
        plainto_tsquery('english', query_text)
      ) AS rank
    FROM audiences a
    WHERE
      query_text != ''
      AND (array_length(categories, 1) IS NULL OR a.category = ANY(categories))
      AND (
        to_tsvector('english', COALESCE(a.display_name, '') || ' ' || COALESCE(a.description, '') || ' ' || COALESCE(a.hierarchical_context, ''))
        @@ plainto_tsquery('english', query_text)
      )
    ORDER BY rank DESC
    LIMIT match_count
  ),
  combined_results AS (
    SELECT
      COALESCE(s.id, k.id) AS id,
      COALESCE(s.name, k.name) AS name,
      COALESCE(s.display_name, k.display_name) AS display_name,
      COALESCE(s.description, k.description) AS description,
      COALESCE(s.size, k.size) AS size,
      COALESCE(s.category, k.category) AS category,
      COALESCE(s.hierarchical_context, k.hierarchical_context) AS hierarchical_context,
      COALESCE(s.similarity, 0.0) AS similarity,
      COALESCE(k.rank, 0.0) AS rank,
      (COALESCE(s.similarity, 0.0) * 0.7 + COALESCE(k.rank, 0.0) * 0.3) AS combined_score
    FROM semantic_results s
    FULL OUTER JOIN keyword_results k ON s.id = k.id
  ),
  team_boost AS (
    SELECT
      cr.*,
      CASE
        WHEN query_text ILIKE '%teams%' 
          AND cr.display_name ~* '\b(NFL|NBA|MLB|NHL|MLS|Premier League|La Liga|Bundesliga|Serie A|Ligue 1)\b'
        THEN cr.combined_score * 1.5
        ELSE cr.combined_score
      END AS boosted_score
    FROM combined_results cr
  )
  SELECT
    tb.id,
    tb.name,
    tb.display_name,
    tb.description,
    tb.size,
    tb.category,
    tb.hierarchical_context,
    tb.similarity,
    tb.rank
  FROM team_boost tb
  ORDER BY tb.boosted_score DESC, tb.similarity DESC
  LIMIT match_count;
END;
$$;
