/*
  # Add Generate Embeddings Function

  1. Function
    - Creates a SQL function to generate embeddings for audiences using Supabase AI
    - Uses the gte-small model for efficient text embeddings
    - Processes audiences in batches to avoid timeouts
    - Updates embedding and embedding_updated_at columns

  2. Notes
    - Uses Supabase's built-in AI inference capabilities
    - Combines name and description for better semantic representation
*/

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
  -- Get OpenAI API key from environment or fail gracefully
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
      -- Call OpenAI API to generate embedding
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

      -- Extract embedding from response
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