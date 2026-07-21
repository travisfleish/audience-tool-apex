/*
  # Add Embedding Column to Audiences Table

  1. Changes
    - Add `embedding` column to store 384-dimensional vectors (gte-small model size)
    - Add index on embedding column for fast similarity search using cosine distance
    - Add `embedding_updated_at` timestamp to track when embeddings were last generated

  2. Notes
    - Using 384 dimensions for gte-small model (efficient and accurate)
    - HNSW index provides fast approximate nearest neighbor search
    - Cosine distance is ideal for text embeddings
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audiences' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE audiences ADD COLUMN embedding vector(384);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audiences' AND column_name = 'embedding_updated_at'
  ) THEN
    ALTER TABLE audiences ADD COLUMN embedding_updated_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS audiences_embedding_idx 
ON audiences 
USING hnsw (embedding vector_cosine_ops);