/*
  # Replace AI Paragraph Descriptions with Semantic Enrichment

  1. Purpose
    - Replace the old AI-generated paragraph descriptions in hierarchical_context
    - Keep the hierarchical path (before the |) but replace everything after with semantic_enrichment
    - Format: {hierarchical_path} | {semantic_enrichment_keywords}
  
  2. Changes
    - Updates 1,316 rows that have the pipe separator format
    - Preserves the hierarchical path structure
    - Replaces verbose paragraphs with concise keyword phrases
  
  3. Example Transformation
    BEFORE: "Gen Z-Asian Fans, NBA, Basketball | Gen Z-Asian Fans are a dynamic and engaged demographic..."
    AFTER:  "Gen Z-Asian Fans, NBA, Basketball | NBA fandom, Gen Z culture, Asian basketball players..."
*/

-- Update hierarchical_context to use semantic_enrichment instead of old AI descriptions
UPDATE audiences
SET hierarchical_context = 
  CASE 
    WHEN hierarchical_context LIKE '%|%' AND semantic_enrichment IS NOT NULL THEN
      -- Extract the path before the pipe and append the new semantic enrichment
      split_part(hierarchical_context, '|', 1) || '| ' || semantic_enrichment
    ELSE
      hierarchical_context
  END
WHERE hierarchical_context LIKE '%|%'
  AND semantic_enrichment IS NOT NULL;
