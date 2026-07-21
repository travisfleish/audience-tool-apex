/*
  # Restore Search Function

  1. Recreate search_audiences_by_embedding function with correct signature
    - Takes query_embedding, match_threshold, and match_count parameters
    - Returns audiences with similarity scores above threshold
    - Uses proper search_path for security

  2. Clean up duplicate semantic_search functions
    - Keep only the version that works with the current setup
*/

-- Drop the broken function if it exists
DROP FUNCTION IF EXISTS public.search_audiences_by_embedding(vector(384), int);

-- Recreate with the correct signature that matches frontend expectations
CREATE OR REPLACE FUNCTION public.search_audiences_by_embedding(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  size bigint,
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
    a.category,
    a.description,
    a.size,
    (1 - (a.embedding <=> query_embedding))::float as similarity
  FROM public.audiences a
  WHERE a.embedding IS NOT NULL
    AND (1 - (a.embedding <=> query_embedding)) >= match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Drop the duplicate/incorrect semantic_search functions
DROP FUNCTION IF EXISTS public.semantic_search(text, int);
DROP FUNCTION IF EXISTS public.semantic_search(text, int, float);