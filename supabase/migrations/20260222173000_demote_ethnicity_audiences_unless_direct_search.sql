/*
  # Demote Ethnicity Audiences Unless Directly Queried

  1. Changes
    - Updates both hybrid_semantic_search overloads (4-param and 5-param)
    - Adds conditional demotion for ethnicity audiences when query is not ethnicity-directed
    - Preserves existing exact match boost behavior in the 5-param overload

  2. Rationale
    - Broad league queries like "NFL" should not surface ethnicity audiences near the top
    - Explicit queries like "Asian fans" should still rank those audiences strongly
*/

CREATE OR REPLACE FUNCTION public.hybrid_semantic_search(
  query_text text,
  query_embedding extensions.vector,
  match_count integer DEFAULT 50,
  score_threshold double precision DEFAULT 0.25
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
  ethnicity_demotion_multiplier constant double precision := 0.40;
  ethnicity_query_regex constant text := '\m(african[ -]?american|asian|hispanic|latino|latina|latinx)\M';
  ethnicity_audience_regex constant text := '\m(african[ -]?american|asian|hispanic|latino|latina|latinx)\M';
  query_is_ethnicity_direct boolean;
BEGIN
  ts_query := websearch_to_tsquery('english', query_text);

  token_count := array_length(
    string_to_array(trim(regexp_replace(query_text, '\s+', ' ', 'g')), ' '),
    1
  );

  IF token_count IS NULL OR token_count <= 2 THEN
    w_semantic := 0.65;
    w_lexical := 0.35;
  ELSE
    w_semantic := 0.80;
    w_lexical := 0.20;
  END IF;

  query_is_ethnicity_direct := lower(query_text) ~ ethnicity_query_regex;

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
      (
        lower(COALESCE(a.display_name, '')) ~ ethnicity_audience_regex
        OR lower(COALESCE(a.name, '')) ~ ethnicity_audience_regex
        OR lower(split_part(COALESCE(a.hierarchical_context, ''), '|', 1)) ~ ethnicity_audience_regex
      ) AS is_ethnicity_audience
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
      (
        s.sim * w_semantic +
        CASE
          WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
          ELSE (s.lex / ml.raw_max)
        END * w_lexical
      ) * CASE
        WHEN s.is_ethnicity_audience AND NOT query_is_ethnicity_direct THEN ethnicity_demotion_multiplier
        ELSE 1.0
      END
    )::double precision AS final_score
  FROM scored s
  CROSS JOIN max_lex ml
  WHERE (
    (
      s.sim * w_semantic +
      CASE
        WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
        ELSE (s.lex / ml.raw_max)
      END * w_lexical
    ) * CASE
      WHEN s.is_ethnicity_audience AND NOT query_is_ethnicity_direct THEN ethnicity_demotion_multiplier
      ELSE 1.0
    END
  ) >= score_threshold
  ORDER BY (
    (
      s.sim * w_semantic +
      CASE
        WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
        ELSE (s.lex / ml.raw_max)
      END * w_lexical
    ) * CASE
      WHEN s.is_ethnicity_audience AND NOT query_is_ethnicity_direct THEN ethnicity_demotion_multiplier
      ELSE 1.0
    END
  ) DESC
  LIMIT match_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.hybrid_semantic_search(
  query_text text,
  raw_query_text text,
  query_embedding extensions.vector,
  match_count integer DEFAULT 50,
  score_threshold double precision DEFAULT 0.25
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
  ethnicity_demotion_multiplier constant double precision := 0.40;
  ethnicity_query_regex constant text := '\m(african[ -]?american|asian|hispanic|latino|latina|latinx)\M';
  ethnicity_audience_regex constant text := '\m(african[ -]?american|asian|hispanic|latino|latina|latinx)\M';
  query_is_ethnicity_direct boolean;
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

  query_is_ethnicity_direct := lower(raw_query_text) ~ ethnicity_query_regex;

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
      CASE
        WHEN lower(split_part(a.hierarchical_context, '|', 1)) LIKE '%' || lower(raw_query_text) || '%'
          OR lower(a.name) LIKE '%' || lower(raw_query_text) || '%'
        THEN 0.5
        ELSE 0.0
      END::double precision AS exact_boost,
      (
        lower(COALESCE(a.display_name, '')) ~ ethnicity_audience_regex
        OR lower(COALESCE(a.name, '')) ~ ethnicity_audience_regex
        OR lower(split_part(COALESCE(a.hierarchical_context, ''), '|', 1)) ~ ethnicity_audience_regex
      ) AS is_ethnicity_audience
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
      (
        s.sim * w_semantic +
        CASE
          WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
          ELSE (s.lex / ml.raw_max)
        END * w_lexical +
        s.exact_boost
      ) * CASE
        WHEN s.is_ethnicity_audience AND NOT query_is_ethnicity_direct THEN ethnicity_demotion_multiplier
        ELSE 1.0
      END
    )::double precision AS final_score
  FROM scored s
  CROSS JOIN max_lex ml
  WHERE (
    (
      s.sim * w_semantic +
      CASE
        WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
        ELSE (s.lex / ml.raw_max)
      END * w_lexical +
      s.exact_boost
    ) * CASE
      WHEN s.is_ethnicity_audience AND NOT query_is_ethnicity_direct THEN ethnicity_demotion_multiplier
      ELSE 1.0
    END
  ) >= score_threshold
  ORDER BY (
    (
      s.sim * w_semantic +
      CASE
        WHEN ml.raw_max IS NULL OR ml.raw_max = 0 THEN 0
        ELSE (s.lex / ml.raw_max)
      END * w_lexical +
      s.exact_boost
    ) * CASE
      WHEN s.is_ethnicity_audience AND NOT query_is_ethnicity_direct THEN ethnicity_demotion_multiplier
      ELSE 1.0
    END
  ) DESC
  LIMIT match_count;
END;
$function$;
