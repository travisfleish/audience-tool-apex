/*
  # Drop deprecated and unused columns from audiences table

  1. Changes
    - Drop deprecated embedding columns that were replaced by newer implementations:
      - `embedding` (replaced by context_embedding, title_embedding, hierarchical_context_embedding)
      - `embedding_model` (replaced by specific model columns for each embedding type)
      - `embedding_updated_at` (replaced by specific timestamp columns)
      - `embedding_v2` (replaced by context_embedding)
      - `embedding_v2_updated_at` (replaced by context_embedding_updated_at)
      - `embedding_version` (replaced by specific version columns)
    - Drop `season` column as it contains all null values and is not used

  2. Security
    - No RLS changes needed as we're only removing unused columns
    
  3. Notes
    - All 7 columns contain only null values across all 1,125 rows
    - No foreign key dependencies exist on these columns
    - TypeScript interfaces will be updated to remove season field
*/

-- Drop deprecated embedding columns
ALTER TABLE audiences DROP COLUMN IF EXISTS embedding;
ALTER TABLE audiences DROP COLUMN IF EXISTS embedding_model;
ALTER TABLE audiences DROP COLUMN IF EXISTS embedding_updated_at;
ALTER TABLE audiences DROP COLUMN IF EXISTS embedding_v2;
ALTER TABLE audiences DROP COLUMN IF EXISTS embedding_v2_updated_at;
ALTER TABLE audiences DROP COLUMN IF EXISTS embedding_version;

-- Drop unused season column
ALTER TABLE audiences DROP COLUMN IF EXISTS season;
