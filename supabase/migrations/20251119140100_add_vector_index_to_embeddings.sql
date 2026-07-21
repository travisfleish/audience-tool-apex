/*
  # Add Vector Index for Fast Similarity Search

  1. Index
    - Creates an IVFFlat index on the embedding column in audiences table
    - Enables fast approximate nearest neighbor search
    - Uses cosine distance operator (<=>)
    - Configured with 100 lists for optimal performance

  2. Performance Impact
    - Dramatically speeds up semantic search queries
    - Allows efficient similarity comparisons across 1000+ records
    - Trades slight accuracy for major speed improvements (standard practice)

  3. Notes
    - Index is created only if it doesn't already exist
    - Uses vector extension's ivfflat algorithm
    - Cosine distance is ideal for normalized embeddings
*/

CREATE INDEX IF NOT EXISTS audiences_embedding_idx 
ON audiences 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);