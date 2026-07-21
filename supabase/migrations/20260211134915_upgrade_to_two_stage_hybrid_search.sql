/*
  # Upgrade to Two-Stage Hybrid Semantic Search

  Replaces the old single-pass hybrid search with a proper two-stage retrieval system.

  1. Changes
    - Ensures `pg_trgm` and `unaccent` extensions are enabled
    - Adds `search_vector` tsvector column to `audiences` table
    - Populates `search_vector` from display_name, description, hierarchical_context, tags
    - Creates GIN index on `search_vector` for fast full-text search
    - Creates trigger to keep `search_vector` auto-updated on insert/update
    - Replaces `hybrid_semantic_search` function with two-stage version:
      - Stage 1: ANN vector retrieval (top 500 candidates via existing IVFFlat index)
      - Stage 2: Rerank using weighted blend (80% semantic, 20% lexical FTS)

  2. What This Removes
    - LIKE-based substring keyword boosts
    - Trigram similarity boost
    - Additive keyword stacking that could overpower semantic scores
    - match_threshold parameter (ranking handles filtering now)

  3. Important Notes
    - Frontend contract preserved: function name and core return columns unchanged
    - `keyword_boost` column renamed to `lexical_score` in return type
    - `match_threshold` parameter removed from function signature
    - Embedding model and enrichment pipeline are NOT changed
    - Existing IVFFlat index (idx_hierarchical_context_embedding_ivfflat) is reused
*/

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add tsvector column for full-text search
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE audiences ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Populate search_vector from existing data
UPDATE audiences
SET search_vector =
  to_tsvector(
    'english',
    coalesce(display_name, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(hierarchical_context, '') || ' ' ||
    array_to_string(coalesce(tags, ARRAY[]::text[]), ' ')
  );

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_audiences_search_vector
ON audiences USING GIN (search_vector);

-- Create trigger to keep search_vector updated on insert/update
CREATE OR REPLACE FUNCTION audiences_search_vector_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector(
      'english',
      coalesce(NEW.display_name, '') || ' ' ||
      coalesce(NEW.description, '') || ' ' ||
      coalesce(NEW.hierarchical_context, '') || ' ' ||
      array_to_string(coalesce(NEW.tags, ARRAY[]::text[]), ' ')
    );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON audiences;

CREATE TRIGGER tsvectorupdate
BEFORE INSERT OR UPDATE
ON audiences
FOR EACH ROW
EXECUTE FUNCTION audiences_search_vector_trigger();

-- Replace hybrid_semantic_search with two-stage retrieval
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
BEGIN
  ts_query := websearch_to_tsquery('english', query_text);

  RETURN QUERY
  WITH vector_candidates AS (
    SELECT a.*
    FROM audiences a
    WHERE a.hierarchical_context_embedding IS NOT NULL
    ORDER BY a.hierarchical_context_embedding <=> query_embedding
    LIMIT 500
  ),
  scored AS (
    SELECT
      vc.id,
      vc.name,
      vc.display_name,
      vc.hierarchical_context,
      vc.description,
      vc.sports_league,
      vc.category,
      vc.tags,
      vc.is_featured,
      vc.created_at,
      vc.updated_at,
      (1 - (vc.hierarchical_context_embedding <=> query_embedding))::double precision AS sim,
      COALESCE(ts_rank_cd(vc.search_vector, ts_query), 0)::double precision AS lex
    FROM vector_candidates vc
  ),
  max_lex AS (
    SELECT GREATEST(MAX(s.lex), 0.001) AS max_val FROM scored s
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
    (s.lex / ml.max_val)::double precision AS lexical_score,
    ((s.sim * 0.8) + ((s.lex / ml.max_val) * 0.2))::double precision AS final_score
  FROM scored s
  CROSS JOIN max_lex ml
  ORDER BY ((s.sim * 0.8) + ((s.lex / ml.max_val) * 0.2)) DESC
  LIMIT match_count;
END;
$function$;
