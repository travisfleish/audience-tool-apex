/*
  # Add Title Embedding Column

  1. New Columns
    - `title_embedding` (vector(384)) - Stores the 384-dimensional embedding vector for the display_name
    - `title_embedding_model` (text) - Stores the model name used (text-embedding-3-small)
    - `title_embedding_dims` (integer) - Stores the dimensionality (384)
    - `title_embedding_version` (integer) - Version number for idempotent updates
    - `title_embedding_updated_at` (timestamptz) - Timestamp of last embedding update

  2. Purpose
    - Enable semantic search on display names using OpenAI embeddings
    - Track embedding metadata for versioning and model tracking
    - Support idempotent updates based on embedding_version
*/

-- Add title_embedding column (384 dimensions for text-embedding-3-small)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'title_embedding'
  ) THEN
    ALTER TABLE audiences ADD COLUMN title_embedding vector(384);
  END IF;
END $$;

-- Add title_embedding_model column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'title_embedding_model'
  ) THEN
    ALTER TABLE audiences ADD COLUMN title_embedding_model text;
  END IF;
END $$;

-- Add title_embedding_dims column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'title_embedding_dims'
  ) THEN
    ALTER TABLE audiences ADD COLUMN title_embedding_dims integer;
  END IF;
END $$;

-- Add title_embedding_version column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'title_embedding_version'
  ) THEN
    ALTER TABLE audiences ADD COLUMN title_embedding_version integer DEFAULT 0;
  END IF;
END $$;

-- Add title_embedding_updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'title_embedding_updated_at'
  ) THEN
    ALTER TABLE audiences ADD COLUMN title_embedding_updated_at timestamptz;
  END IF;
END $$;

-- Create index for vector similarity search on title_embedding
CREATE INDEX IF NOT EXISTS idx_audiences_title_embedding 
ON audiences 
USING ivfflat (title_embedding vector_cosine_ops)
WITH (lists = 100);
