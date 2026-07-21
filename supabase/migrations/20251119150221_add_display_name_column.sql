/*
  # Add display_name column to audiences table

  1. Changes
    - Add `display_name` column to audiences table (text type)
    - Populate display_name by extracting the last segment after the final " > " separator
    - For names without " > ", the entire name becomes the display_name

  2. Notes
    - Uses string splitting to extract the last nested name from the full path
    - Example: "Genius Sports > Youth Sports > Wrestling > Wrestling Parents" → "Wrestling Parents"
*/

-- Add the display_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' 
    AND column_name = 'display_name'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.audiences ADD COLUMN display_name text;
  END IF;
END $$;

-- Populate display_name by extracting the last segment after " > "
UPDATE audiences
SET display_name = CASE
  WHEN name LIKE '% > %' THEN 
    SUBSTRING(name FROM '.*> (.*)$')
  ELSE 
    name
END
WHERE display_name IS NULL OR display_name = '';

-- Verify the results
DO $$
DECLARE
  total_count int;
  populated_count int;
BEGIN
  SELECT COUNT(*) INTO total_count FROM audiences;
  SELECT COUNT(*) INTO populated_count FROM audiences WHERE display_name IS NOT NULL AND display_name != '';
  
  RAISE NOTICE 'Total audiences: %, Display names populated: %', total_count, populated_count;
END $$;
