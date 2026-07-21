/*
  # Remove and prevent incomplete audience taxonomy rows

  1. Data cleanup
    - Delete audience rows where `name` does not contain a full taxonomy path
    - Full taxonomy is defined as at least 4 non-empty path segments split by `>`

  2. Data integrity
    - Add a CHECK constraint to prevent future inserts/updates with incomplete taxonomy
*/

-- Remove current incomplete taxonomy rows.
DELETE FROM audiences
WHERE name !~ '^\s*[^>]+\s*>\s*[^>]+\s*>\s*[^>]+\s*>\s*[^>]+(?:\s*>\s*[^>]+)*\s*$';

-- Enforce taxonomy depth going forward.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'audiences_name_full_taxonomy_check'
  ) THEN
    ALTER TABLE audiences
    ADD CONSTRAINT audiences_name_full_taxonomy_check
    CHECK (
      name ~ '^\s*[^>]+\s*>\s*[^>]+\s*>\s*[^>]+\s*>\s*[^>]+(?:\s*>\s*[^>]+)*\s*$'
    );
  END IF;
END $$;
