/*
  # Add Semantic Search Function

  1. Function
    - Creates a function to search audiences by vector similarity
    - Uses cosine distance to find semantically similar audiences
    - Returns audiences ordered by relevance score

  2. Parameters
    - query_embedding: The embedding vector of the search query
    - match_threshold: Minimum similarity score (0-1, where 1 is identical)
    - match_count: Maximum number of results to return

  3. Notes
    - Lower distance = higher similarity
    - Uses 1 - distance to convert to similarity score
    - Only returns audiences that have embeddings
*/

CREATE OR REPLACE FUNCTION search_audiences_by_embedding(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  sports_league text,
  season text,
  tags text[],
  is_featured boolean,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.description,
    a.category,
    a.sports_league,
    a.season,
    a.tags,
    a.is_featured,
    1 - (a.embedding <=> query_embedding) as similarity
  FROM audiences a
  WHERE a.embedding IS NOT NULL
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;