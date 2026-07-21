/*
  # Consolidate All Retail Innovation Lab Audiences to Retail Category

  1. Changes
    - Update all audiences that start with "Retail Innovation Lab" to have category "Retail"
    - This consolidates audiences from various subcategories into a single "Retail" filter
  
  2. Affected Audiences
    - All audiences under "Retail Innovation Lab" hierarchy regardless of their current category
*/

UPDATE audiences 
SET category = 'Retail' 
WHERE name LIKE 'Retail Innovation Lab%';