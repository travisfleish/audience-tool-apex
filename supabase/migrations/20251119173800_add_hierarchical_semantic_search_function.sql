/*
  # Add Hierarchical Context Semantic Search Function
  
  1. New Function
    - `hierarchical_semantic_search` - Performs semantic search using hierarchical_context_embedding
    - Takes query text and optional threshold (defaults to 0.4)
    - Returns matching audiences with similarity scores
  
  2. Purpose
    - Enable semantic search using the full hierarchical context embeddings
    - Properly handle vector similarity calculations in the database
*/

CREATE OR REPLACE FUNCTION hierarchical_semantic_search(
  query_text text,
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  display_name text,
  hierarchical_context text,
  description text,
  sports_league text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_embedding vector(384);
  embedding_response json;
BEGIN
  -- Generate embedding using the edge function
  SELECT content::json INTO embedding_response
  FROM http((
    'POST',
    current_setting('app.settings.supabase_url') || '/functions/v1/generate-embeddings',
    ARRAY[
      http_header('Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    json_build_object('text', query_text)::text
  )::http_request);

  -- Extract the embedding array
  query_embedding := (embedding_response->>'embedding')::vector(384);

  -- Return matching audiences using hierarchical_context_embedding
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.display_name,
    a.hierarchical_context,
    a.description,
    a.sports_league,
    a.category,
    1 - (a.hierarchical_context_embedding <=> query_embedding) AS similarity
  FROM audiences a
  WHERE a.hierarchical_context_embedding IS NOT NULL
    AND 1 - (a.hierarchical_context_embedding <=> query_embedding) >= match_threshold
  ORDER BY a.hierarchical_context_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
