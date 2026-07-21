/*
  # Add Semantic Search Wrapper Function

  1. Function
    - Creates a wrapper function that generates embeddings and searches
    - Takes text input instead of pre-computed embedding
    - Calls OpenAI API to generate embedding, then searches
    - Returns audiences ordered by semantic similarity

  2. Parameters
    - query_text: The search query text
    - match_count: Maximum number of results to return
    - similarity_threshold: Minimum similarity score (0-1)

  3. Notes
    - Requires HTTP extension for API calls
    - Calls search_audiences_by_embedding internally
    - Simplifies frontend integration
*/

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
  -- Get OpenAI API key from environment
  SELECT current_setting('app.openai_api_key', true) INTO openai_key;

  IF openai_key IS NULL THEN
    RAISE EXCEPTION 'OpenAI API key not configured';
  END IF;

  -- Call OpenAI API to generate embedding for query
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

  -- Extract embedding from response
  query_embedding := (api_response->'data'->0->'embedding')::text::vector(384);

  -- Use existing search function
  RETURN QUERY
  SELECT * FROM search_audiences_by_embedding(
    query_embedding,
    similarity_threshold,
    match_count
  );
END;
$$;
