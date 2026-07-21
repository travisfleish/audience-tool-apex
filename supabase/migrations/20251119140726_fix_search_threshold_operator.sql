/*
  # Fix Search Threshold Operator

  1. Changes
    - Updates WHERE clause to use >= instead of >
    - Allows results that exactly match the threshold
    - Previously: similarity > threshold (excludes exact matches)
    - Now: similarity >= threshold (includes exact matches)

  2. Impact
    - More inclusive results when similarity exactly equals threshold
    - Standard behavior for threshold comparisons
*/

CREATE OR REPLACE FUNCTION search_audiences_by_embedding(
  query_embedding vector(384),
  similarity_threshold float DEFAULT 0.5,
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
    AND 1 - (a.embedding <=> query_embedding) >= similarity_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;