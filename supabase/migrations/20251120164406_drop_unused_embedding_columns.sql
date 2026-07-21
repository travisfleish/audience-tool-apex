/*
  # Drop unused embedding columns from audiences table

  1. Changes
    - Drop `title_embedding` and related metadata columns:
      - `title_embedding`
      - `title_embedding_model`
      - `title_embedding_dims`
      - `title_embedding_version`
      - `title_embedding_updated_at`
    - Drop `context_embedding` and related metadata columns:
      - `context_embedding`
      - `context_embedding_model`
      - `context_embedding_dims`
      - `context_embedding_version`
      - `context_embedding_updated_at`
    - Drop `embedding_text` (was used to generate deprecated embeddings)
    - Drop `aliases` (unused array column)

  2. Rationale
    - Only `hierarchical_context_embedding` is used by the active search function
    - `title_embedding` and `context_embedding` were experimental and are no longer used
    - Removing these columns will reduce database storage and improve query performance
    - All 1,125 rows have data in these columns but they serve no purpose

  3. Security
    - No RLS changes needed as we're only removing unused columns
*/

-- Drop title_embedding and its metadata
ALTER TABLE audiences DROP COLUMN IF EXISTS title_embedding;
ALTER TABLE audiences DROP COLUMN IF EXISTS title_embedding_model;
ALTER TABLE audiences DROP COLUMN IF EXISTS title_embedding_dims;
ALTER TABLE audiences DROP COLUMN IF EXISTS title_embedding_version;
ALTER TABLE audiences DROP COLUMN IF EXISTS title_embedding_updated_at;

-- Drop context_embedding and its metadata
ALTER TABLE audiences DROP COLUMN IF EXISTS context_embedding;
ALTER TABLE audiences DROP COLUMN IF EXISTS context_embedding_model;
ALTER TABLE audiences DROP COLUMN IF EXISTS context_embedding_dims;
ALTER TABLE audiences DROP COLUMN IF EXISTS context_embedding_version;
ALTER TABLE audiences DROP COLUMN IF EXISTS context_embedding_updated_at;

-- Drop other unused columns
ALTER TABLE audiences DROP COLUMN IF EXISTS embedding_text;
ALTER TABLE audiences DROP COLUMN IF EXISTS aliases;
