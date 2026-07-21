/*
  # Add Hierarchical Context Embedding Column
  
  1. New Column
    - `hierarchical_context_embedding` (vector(384)) - Stores embeddings generated from hierarchical_context
    - `hierarchical_context_embedding_model` (text) - Model used for embedding generation
    - `hierarchical_context_embedding_dims` (integer) - Dimensionality of the embedding
    - `hierarchical_context_embedding_version` (integer) - Version number for tracking updates
    - `hierarchical_context_embedding_updated_at` (timestamptz) - Last update timestamp
  
  2. Purpose
    - Generate embeddings from the full hierarchical context (e.g., "Golden State Warriors, NBA, Basketball")
    - This will provide much better semantic search results for hierarchical audiences
  
  3. Index
    - Create IVFFlat index for fast similarity search
*/

-- Add the embedding column and metadata columns
ALTER TABLE audiences 
ADD COLUMN IF NOT EXISTS hierarchical_context_embedding vector(384),
ADD COLUMN IF NOT EXISTS hierarchical_context_embedding_model text,
ADD COLUMN IF NOT EXISTS hierarchical_context_embedding_dims integer,
ADD COLUMN IF NOT EXISTS hierarchical_context_embedding_version integer,
ADD COLUMN IF NOT EXISTS hierarchical_context_embedding_updated_at timestamptz;

-- Create IVFFlat index for fast similarity search
-- Using 100 lists as a reasonable default for moderate-sized datasets
CREATE INDEX IF NOT EXISTS idx_hierarchical_context_embedding_ivfflat 
ON audiences 
USING ivfflat (hierarchical_context_embedding vector_cosine_ops)
WITH (lists = 100);
