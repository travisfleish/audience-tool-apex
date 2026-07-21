/*
  # Consolidate Retail Categories

  1. Changes
    - Consolidate all retail-related categories into a single "Retail" category
    - Updates "Retailers" and "Specialty Retailers" to "Retail"
  
  2. Affected Categories
    - "Retailers" → "Retail"
    - "Specialty Retailers" → "Retail"
*/

-- Update all retail-related categories to "Retail"
UPDATE audiences 
SET category = 'Retail' 
WHERE category IN ('Retailers', 'Specialty Retailers');