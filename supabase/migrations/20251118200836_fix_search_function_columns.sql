/*
  # Fix Search Function Columns

  1. Update search_audiences_by_embedding function
    - Remove non-existent 'size' column
    - Return correct columns that match the audiences table structure
    - Include all relevant fields for the Audience interface
*/

-- Drop and recreate with correct columns
DROP FUNCTION IF EXISTS public.search_audiences_by_embedding(vector(384), float, int);

CREATE OR REPLACE FUNCTION public.search_audiences_by_embedding(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  tags text[],
  is_featured boolean,
  season text,
  sports_league text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.description,
    a.category,
    a.tags,
    a.is_featured,
    a.season,
    a.sports_league,
    a.created_at,
    a.updated_at,
    (1 - (a.embedding <=> query_embedding))::float as similarity
  FROM public.audiences a
  WHERE a.embedding IS NOT NULL
    AND (1 - (a.embedding <=> query_embedding)) >= match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;