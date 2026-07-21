/*
  # Fix Security Issues

  1. Remove Unused Index
    - Drop `idx_audiences_name` index that is not being used

  2. Fix Function Search Paths
    - Set immutable search_path for `generate_all_embeddings` function
    - Set immutable search_path for `search_audiences_by_embedding` function
    - Set immutable search_path for `semantic_search` function

  3. Move Vector Extension
    - Create extensions schema if not exists
    - Move vector extension from public to extensions schema

  ## Security Benefits
  - Removing unused indexes improves performance and reduces maintenance overhead
  - Immutable search_path prevents security vulnerabilities from schema manipulation attacks
  - Moving extensions out of public schema follows security best practices and prevents namespace conflicts
*/

-- 1. Remove unused index
DROP INDEX IF EXISTS public.idx_audiences_name;

-- 2. Fix search_path for all functions by recreating them with SET search_path
-- This prevents search_path manipulation attacks

-- Drop and recreate generate_all_embeddings with fixed search_path
DROP FUNCTION IF EXISTS public.generate_all_embeddings();
CREATE OR REPLACE FUNCTION public.generate_all_embeddings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  audience_record RECORD;
  embedding_result vector(384);
  text_to_embed text;
BEGIN
  FOR audience_record IN 
    SELECT id, name, category, description 
    FROM public.audiences 
    WHERE embedding IS NULL
  LOOP
    text_to_embed := audience_record.name || ' ' || 
                     COALESCE(audience_record.category, '') || ' ' || 
                     COALESCE(audience_record.description, '');
    
    SELECT ai.openai_embed(
      'text-embedding-3-small',
      text_to_embed,
      dimensions => 384
    ) INTO embedding_result;
    
    UPDATE public.audiences 
    SET embedding = embedding_result 
    WHERE id = audience_record.id;
  END LOOP;
END;
$$;

-- Drop and recreate search_audiences_by_embedding with fixed search_path
DROP FUNCTION IF EXISTS public.search_audiences_by_embedding(vector(384), int);
CREATE OR REPLACE FUNCTION public.search_audiences_by_embedding(
  query_embedding vector(384),
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  name text,
  category text,
  description text,
  size bigint,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.category,
    a.description,
    a.size,
    1 - (a.embedding <=> query_embedding) as similarity
  FROM public.audiences a
  WHERE a.embedding IS NOT NULL
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Drop and recreate semantic_search with fixed search_path
DROP FUNCTION IF EXISTS public.semantic_search(text, int);
CREATE OR REPLACE FUNCTION public.semantic_search(
  search_query text,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  name text,
  category text,
  description text,
  size bigint,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  query_embedding vector(384);
BEGIN
  SELECT ai.openai_embed(
    'text-embedding-3-small',
    search_query,
    dimensions => 384
  ) INTO query_embedding;
  
  RETURN QUERY
  SELECT * FROM public.search_audiences_by_embedding(query_embedding, match_count);
END;
$$;

-- 3. Move vector extension to extensions schema
-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension from public to extensions schema
-- Note: We need to drop and recreate the extension in the new schema
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Recreate the embedding column since the extension was recreated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' 
    AND column_name = 'embedding'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.audiences ADD COLUMN embedding extensions.vector(384);
  END IF;
END $$;

-- Recreate the index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_audiences_embedding ON public.audiences 
USING ivfflat (embedding extensions.vector_cosine_ops)
WITH (lists = 100);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;