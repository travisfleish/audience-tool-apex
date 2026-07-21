/*
  # Revert Security Fixes
  
  This migration reverts the security-related changes and restores the original working functions.
  
  1. Move vector extension back to public schema
  2. Restore original function definitions without SET search_path
  3. Restore the original search_audiences_by_embedding function signature
*/

-- 1. Move vector extension back to public schema
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Recreate the embedding column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' 
    AND column_name = 'embedding'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.audiences ADD COLUMN embedding vector(384);
  END IF;
END $$;

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_audiences_embedding ON public.audiences 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 2. Restore generate_all_embeddings function (without SET search_path)
DROP FUNCTION IF EXISTS public.generate_all_embeddings();
CREATE OR REPLACE FUNCTION generate_all_embeddings()
RETURNS TABLE (processed_count int, failed_count int)
LANGUAGE plpgsql
AS $$
DECLARE
  audience_record RECORD;
  embedding_result vector(384);
  processed int := 0;
  failed int := 0;
  api_response json;
  openai_key text;
BEGIN
  SELECT current_setting('app.openai_api_key', true) INTO openai_key;

  IF openai_key IS NULL THEN
    RAISE EXCEPTION 'OpenAI API key not configured';
  END IF;

  FOR audience_record IN
    SELECT id, name, description
    FROM audiences
    WHERE embedding IS NULL
    LIMIT 100
  LOOP
    BEGIN
      SELECT content::json INTO api_response
      FROM http((
        'POST',
        'https://api.openai.com/v1/embeddings',
        ARRAY[
          http_header('Authorization', 'Bearer ' || openai_key),
          http_header('Content-Type', 'application/json')
        ],
        'application/json',
        json_build_object(
          'model', 'text-embedding-3-small',
          'input', audience_record.name || E'\n' || audience_record.description,
          'dimensions', 384
        )::text
      )::http_request);

      embedding_result := (api_response->'data'->0->'embedding')::text::vector(384);

      UPDATE audiences
      SET
        embedding = embedding_result,
        embedding_updated_at = now()
      WHERE id = audience_record.id;

      processed := processed + 1;
    EXCEPTION WHEN OTHERS THEN
      failed := failed + 1;
      RAISE NOTICE 'Failed to process audience %: %', audience_record.id, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT processed, failed;
END;
$$;

-- 3. Restore search_audiences_by_embedding with original signature
DROP FUNCTION IF EXISTS public.search_audiences_by_embedding(vector(384), float, int);

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
    AND (1 - (a.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Restore semantic_search wrapper function
DROP FUNCTION IF EXISTS public.semantic_search(text, int);
DROP FUNCTION IF EXISTS public.semantic_search(text, int, float);

CREATE OR REPLACE FUNCTION semantic_search(
  query_text text,
  match_count int DEFAULT 50,
  similarity_threshold float DEFAULT 0.5
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
DECLARE
  query_embedding vector(384);
  api_response json;
  openai_key text;
BEGIN
  SELECT current_setting('app.openai_api_key', true) INTO openai_key;

  IF openai_key IS NULL THEN
    RAISE EXCEPTION 'OpenAI API key not configured';
  END IF;

  SELECT content::json INTO api_response
  FROM http((
    'POST',
    'https://api.openai.com/v1/embeddings',
    ARRAY[
      http_header('Authorization', 'Bearer ' || openai_key),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    json_build_object(
      'model', 'text-embedding-3-small',
      'input', query_text,
      'dimensions', 384
    )::text
  )::http_request);

  query_embedding := (api_response->'data'->0->'embedding')::text::vector(384);

  RETURN QUERY
  SELECT * FROM search_audiences_by_embedding(
    query_embedding,
    similarity_threshold,
    match_count
  );
END;
$$;