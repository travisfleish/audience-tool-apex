/*
  # Add Exact Hierarchy Match Boost to Hybrid Search

  1. Changes
    - Adds exact match detection for raw_query_text in TAXONOMY PATH only (before "|" separator)
    - Applies a strong boost (0.5) when exact matches are found in the hierarchy
    - Updates final_score calculation to include exact_match_boost as a third component
    - Only checks the taxonomy path, NOT the semantic enrichment keywords

  2. Scoring Formula (NEW)
    - final_score = (similarity * w_semantic) + (lexical_score * w_lexical) + exact_match_boost
    - exact_match_boost = 0.5 if raw_query_text found in taxonomy path or name (case-insensitive)
    - exact_match_boost = 0.0 otherwise

  3. Example
    - Query: "youth sports"
    - hierarchical_context: "Figure Skating Parents, Figure Skating, Youth Sports | youth sports clubs..."
    - Only the part BEFORE "|" is checked: "Figure Skating Parents, Figure Skating, Youth Sports"
    - This audience gets the boost because "Youth Sports" appears in the taxonomy path
    - NWSL audiences with "youth sports leagues" in enrichment text do NOT get the boost

  4. Important Notes
    - Creates a NEW 5-parameter overload with exact match logic
    - Increased boost from 0.3 to 0.5 for stronger prioritization
    - Only checks taxonomy path portion of hierarchical_context (before "|")
    - Also checks full name field for exact matches
*/

CREATE OR REPLACE FUNCTION public.hybrid_semantic_search(
  query_text text,
  raw_query_text text,
  query_embedding vector,
  match_count integer DEFAULT 50,
  score_threshold double precision DEFAULT 0.15
)
RETURNS TABLE(
  id uuid,
  name text,
  display_name text,
  hierarchical_context text,
  description text,
  sports_league text,
  category text,
  tags text[],
  is_featured boolean,
  created_at timestamptz,
  updated_at timestamptz,
  similarity double precision,
  lexical_score double precision,
  final_score double precision
)
LANGUAGE plpgsql STABLE
AS $function$
DECLARE
  ts_query tsquery;
  token_count integer;
  w_semantic double precision;
  w_lexical double precision;
BEGIN
  ts_query := websearch_to_tsquery('english', raw_query_text);

  token_count := array_length(
    string_to_array(trim(regexp_replace(raw_query_text, '\s+', ' ', 'g')), ' '),
    1
  );

  IF token_count IS NULL OR token_count <= 2 THEN
    w_semantic := 0.65;
    w_lexical := 0.35;
  ELSE
    w_semantic := 0.80;
    w_lexical := 0.20;
  END IF;

  RETURN QUERY
  WITH scored AS (
    SELECT
      a.id,
      a.name,
      a.display_name,
      a.hierarchical_context,
      a.description,
      a.sports_league,
      a.category,
      a.tags,
      a.is_featured,
      a.created_at,
      a.updated_at,
      (1 - (a.hierarchical_context_embedding <=> query_embedding))::double precision AS sim,
      COALESCE(ts_rank_cd(a.search_vector, ts_query), 0)::double precision AS lex,
      -- Add exact match boost: 0.5 if raw_query_text appears in TAXONOMY PATH (before "|") or name
      CASE
        WHEN lower(split_part(a.hierarchical_context, '|', 1)) LIKE '%' || lower(raw_query_text) || '%'
          OR lower(a.name) LIKE '%' || lower(raw_query_text) || '%'
        THEN 0.5
        ELSE 0.0
      END::double precision AS exact_boost
    FROM audiences a
    WHERE a.hierarchical_context_embedding IS NOT NULL
  ),
  max_lex AS (
    SELECT MAX(s.lex) AS raw_max FROM scored s
  )
  SELECT
    s.id,
    s.name,
    s.display_name,
    s.hierarchical_context,
    s.description,
    s.sports_league,
    s.category,
    s.tags,
    s.is_featured,
    s.created_at,
    s.updated_at,
    s.sim AS similarity,
    CASE
      WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
      ELSE (s.lex / ml.raw_max)
    END::double precision AS lexical_score,
    (
      s.sim * w_semantic +
      CASE
        WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
        ELSE (s.lex / ml.raw_max)
      END * w_lexical +
      s.exact_boost  -- Add exact match boost to final score
    )::double precision AS final_score
  FROM scored s
  CROSS JOIN max_lex ml
  WHERE (
    s.sim * w_semantic +
    CASE
      WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
      ELSE (s.lex / ml.raw_max)
    END * w_lexical +
    s.exact_boost
  ) >= score_threshold
  ORDER BY (
    s.sim * w_semantic +
    CASE
      WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
      ELSE (s.lex / ml.raw_max)
    END * w_lexical +
    s.exact_boost
  ) DESC
  LIMIT match_count;
END;
$function$;
