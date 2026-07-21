/*
  # Add Hierarchical Context Semantic Search Function (v2)
  
  1. New Function
    - `hierarchical_semantic_search` - Performs semantic search using hierarchical_context_embedding
    - Takes pre-computed query embedding as input
    - Returns matching audiences with similarity scores
  
  2. Purpose
    - Enable semantic search using the full hierarchical context embeddings
    - Client generates embedding, function performs similarity search
*/

DROP FUNCTION IF EXISTS hierarchical_semantic_search(text, float, int);

CREATE OR REPLACE FUNCTION hierarchical_semantic_search(
  query_embedding vector(384),
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
LANGUAGE sql
STABLE
AS $$
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
$$;
