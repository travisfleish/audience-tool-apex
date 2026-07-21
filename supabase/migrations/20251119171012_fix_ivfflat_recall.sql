/*
  # Fix IVFFlat Recall Issue
  
  1. Problem
    - IVFFlat approximate index missing relevant results (e.g., "NFL Swifties" for "taylor swift" query)
    - Brute-force search finds it at rank #3 with 0.50 similarity
    - IVFFlat search completely misses it
    
  2. Solution
    - Increase ivfflat.probes from default (1) to 10 for better recall
    - This makes the index check more clusters, improving accuracy at slight performance cost
    
  3. Changes
    - Update search_audiences_by_title function to set probes = 10
*/

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
