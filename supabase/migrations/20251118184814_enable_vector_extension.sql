/*
  # Enable pgvector Extension

  1. Extension
    - Enable the `vector` extension for semantic similarity search
    - This allows storing and querying vector embeddings
*/

CREATE EXTENSION IF NOT EXISTS vector;