/*
  # Add Title Semantic Search Function

  1. New Functions
    - `search_audiences_by_title` - Performs semantic search using title_embedding
    
  2. Purpose
    - Enable AI-powered semantic search on audience display names
    - Returns audiences ranked by cosine similarity to query
    - Uses OpenAI text-embedding-3-small embeddings (384 dimensions)
    
  3. Parameters
    - query_embedding: vector(384) - The embedding vector for the search query
    - match_threshold: float - Minimum similarity score (0-1)
    - match_count: int - Maximum number of results to return
    
  4. Returns
    - id, display_name, description, category, tags, is_featured, season, sports_league
    - similarity score for ranking
*/

-- Create function for title-based semantic search
CREATE OR REPLACE FUNCTION search_audiences_by_title(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  display_name text,
  description text,
  category text,
  tags text[],
  is_featured boolean,
  season text,
  sports_league text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.display_name,
    a.description,
    a.category,
    a.tags,
    a.is_featured,
    a.season,
    a.sports_league,
    1 - (a.title_embedding <=> query_embedding) as similarity
  FROM audiences a
  WHERE a.title_embedding IS NOT NULL
    AND 1 - (a.title_embedding <=> query_embedding) >= match_threshold
  ORDER BY a.title_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
