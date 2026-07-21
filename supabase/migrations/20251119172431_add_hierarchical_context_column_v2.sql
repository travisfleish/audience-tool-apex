/*
  # Add Hierarchical Context Column
  
  1. New Column
    - `hierarchical_context` (text) - Stores the full hierarchy from the name column
      excluding "Genius Sports", in reverse order, comma-separated
    - Example: "Genius Sports > Basketball > NBA > Golden State Warriors" 
      becomes "Golden State Warriors, NBA, Basketball"
  
  2. Purpose
    - This will be used to generate better embeddings that include the full context
    - Helps specific teams (like "Golden State Warriors") match queries like "nba teams"
    - The reverse order prioritizes the most specific term first
*/

-- Add the new column
ALTER TABLE audiences 
ADD COLUMN IF NOT EXISTS hierarchical_context text;

-- Create a function to reverse and join the hierarchy
CREATE OR REPLACE FUNCTION reverse_hierarchy(input_name text) 
RETURNS text AS $$
DECLARE
  parts text[];
  reversed_parts text[];
  i integer;
BEGIN
  -- Remove "Genius Sports > " prefix
  input_name := regexp_replace(input_name, '^Genius Sports\s*>\s*', '');
  
  -- Split by '>'
  parts := string_to_array(input_name, '>');
  
  -- Trim each part and reverse the array
  FOR i IN 1..array_length(parts, 1) LOOP
    parts[i] := trim(parts[i]);
  END LOOP;
  
  -- Reverse the array manually
  FOR i IN REVERSE array_length(parts, 1)..1 LOOP
    reversed_parts := array_append(reversed_parts, parts[i]);
  END LOOP;
  
  -- Join with ', '
  RETURN array_to_string(reversed_parts, ', ');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Populate the column using the function
UPDATE audiences
SET hierarchical_context = reverse_hierarchy(name)
WHERE name IS NOT NULL AND name LIKE '%>%';

-- For audiences without hierarchy (no '>'), just use display_name
UPDATE audiences
SET hierarchical_context = display_name
WHERE name IS NOT NULL 
  AND name NOT LIKE '%>%'
  AND hierarchical_context IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hierarchical_context ON audiences(hierarchical_context);
