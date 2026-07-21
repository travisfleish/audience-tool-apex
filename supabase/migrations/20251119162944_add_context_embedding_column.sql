/*
  # Add Context Embedding Column

  1. New Columns
    - `context_embedding` (vector(384)) - Stores the 384-dimensional embedding vector for the embedding_text
    - `context_embedding_model` (text) - Stores the model name used (text-embedding-3-small)
    - `context_embedding_dims` (integer) - Stores the dimensionality (384)
    - `context_embedding_version` (integer) - Version number for idempotent updates
    - `context_embedding_updated_at` (timestamptz) - Timestamp of last embedding update

  2. Purpose
    - Enable semantic search on audience descriptions using OpenAI embeddings
    - Track embedding metadata for versioning and model tracking
    - Support idempotent updates based on embedding_version
*/

-- Add context_embedding column (384 dimensions for text-embedding-3-small)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'context_embedding'
  ) THEN
    ALTER TABLE audiences ADD COLUMN context_embedding vector(384);
  END IF;
END $$;

-- Add context_embedding_model column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'context_embedding_model'
  ) THEN
    ALTER TABLE audiences ADD COLUMN context_embedding_model text;
  END IF;
END $$;

-- Add context_embedding_dims column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'context_embedding_dims'
  ) THEN
    ALTER TABLE audiences ADD COLUMN context_embedding_dims integer;
  END IF;
END $$;

-- Add context_embedding_version column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'context_embedding_version'
  ) THEN
    ALTER TABLE audiences ADD COLUMN context_embedding_version integer DEFAULT 0;
  END IF;
END $$;

-- Add context_embedding_updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'context_embedding_updated_at'
  ) THEN
    ALTER TABLE audiences ADD COLUMN context_embedding_updated_at timestamptz;
  END IF;
END $$;

-- Create index for vector similarity search on context_embedding
CREATE INDEX IF NOT EXISTS idx_audiences_context_embedding 
ON audiences 
USING ivfflat (context_embedding vector_cosine_ops)
WITH (lists = 100);
