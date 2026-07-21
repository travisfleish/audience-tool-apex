/*
  # Update Default Threshold to 0.4
  
  1. Change
    - Update search_audiences_by_title function default threshold from 0.3 to 0.4
    - This will return more relevant results by requiring higher similarity scores
*/

CREATE OR REPLACE FUNCTION search_audiences_by_title(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.4,
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
  -- Increase probes for better recall (checks more IVFFlat clusters)
  SET LOCAL ivfflat.probes = 10;
  
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
