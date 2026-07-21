/*
  # Add Event Sport Guardrail On Strict Event Filtering

  1. Changes
    - Replaces 8-parameter hybrid_semantic_search to add explicit cross-sport exclusion
      when seasonal event keys are selected.
    - Keeps strict event membership requirement.

  2. Rationale
    - Prevents rows accidentally mapped to an event from leaking in if their explicit sport
      conflicts with the selected event sport.
*/

create or replace function public.hybrid_semantic_search(
  query_text text,
  raw_query_text text,
  query_embedding extensions.vector,
  match_count integer default 50,
  score_threshold double precision default 0.25,
  season_year integer default null,
  season_quarter text default null,
  season_event_keys text[] default null
)
returns table(
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
language plpgsql stable
as $function$
declare
  ts_query tsquery;
  token_count integer;
  w_semantic double precision;
  w_lexical double precision;
  resolved_season_year integer;
  has_seasonal_intent boolean;
  require_strict_event_match boolean;
  selected_event_sports text[];
  ethnicity_demotion_multiplier constant double precision := 0.40;
  ethnicity_query_regex constant text := '\m(african[ -]?american|asian|hispanic|latino|latina|latinx)\M';
  ethnicity_audience_regex constant text := '\m(african[ -]?american|asian|hispanic|latino|latina|latinx)\M';
  team_or_club_query_regex constant text := '\m(team|teams|club|clubs)\M';
  query_is_ethnicity_direct boolean;
  query_combined_norm text;
begin
  ts_query := websearch_to_tsquery('english', raw_query_text);

  token_count := array_length(
    string_to_array(trim(regexp_replace(raw_query_text, '\s+', ' ', 'g')), ' '),
    1
  );

  if token_count is null or token_count <= 2 then
    w_semantic := 0.65;
    w_lexical := 0.35;
  else
    w_semantic := 0.80;
    w_lexical := 0.20;
  end if;

  resolved_season_year := coalesce(season_year, 2026);
  has_seasonal_intent := season_quarter is not null
    or (season_event_keys is not null and coalesce(array_length(season_event_keys, 1), 0) > 0);
  require_strict_event_match := season_event_keys is not null and coalesce(array_length(season_event_keys, 1), 0) > 0;

  query_is_ethnicity_direct := lower(raw_query_text) ~ ethnicity_query_regex;
  query_combined_norm := lower(concat_ws(' ', coalesce(raw_query_text, ''), coalesce(query_text, '')));

  select array_agg(distinct sport)
  into selected_event_sports
  from (
    select case
      when event_key in (
        'super_bowl',
        'nfl_playoffs',
        'nfl_kickoff',
        'nfl_regular_season_peak',
        'cfp_national_championship',
        'college_football_kickoff',
        'cfb_rivalry_and_bowls'
      ) then 'football'
      when event_key in ('march_madness', 'nba_finals', 'nba_playoffs', 'wnba_playoffs') then 'basketball'
      when event_key in ('mlb_opening_day', 'mlb_postseason', 'world_series') then 'baseball'
      when event_key in ('stanley_cup_finals', 'nhl_opening_week') then 'hockey'
      when event_key in ('fifa_world_cup', 'ucl_final', 'mls_playoffs', 'nwsl_playoffs') then 'soccer'
      when event_key in ('daytona_500', 'indy_500') then 'racing'
      when event_key in ('masters') then 'golf'
      when event_key in ('us_open_series') then 'tennis'
      when event_key in ('wrestlemania') then 'wrestling'
      else null
    end as sport
    from unnest(coalesce(season_event_keys, '{}'::text[])) as event_key
  ) mapped
  where sport is not null;

  return query
  with scored as (
    select
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
      (1 - (a.hierarchical_context_embedding <=> query_embedding))::double precision as sim,
      coalesce(ts_rank_cd(a.search_vector, ts_query), 0)::double precision as lex,
      case
        when lower(split_part(a.hierarchical_context, '|', 1)) like '%' || lower(raw_query_text) || '%'
          or lower(a.name) like '%' || lower(raw_query_text) || '%'
        then 0.5
        else 0.0
      end::double precision as exact_boost,
      case
        when 'team' = any(coalesce(a.tags, '{}'::text[]))
          and query_combined_norm ~ team_or_club_query_regex
          and (
            (
              query_combined_norm ~ '\m(mlb|major league baseball)\M'
              and upper(coalesce(a.sports_league, '')) = 'MLB'
            )
            or (
              query_combined_norm ~ '\m(nba|national basketball association)\M'
              and upper(coalesce(a.sports_league, '')) = 'NBA'
            )
            or (
              query_combined_norm ~ '\m(nfl|national football league)\M'
              and upper(coalesce(a.sports_league, '')) = 'NFL'
            )
            or (
              query_combined_norm ~ '\m(nhl|national hockey league)\M'
              and upper(coalesce(a.sports_league, '')) = 'NHL'
            )
            or (
              query_combined_norm ~ '\m(mls|major league soccer)\M'
              and upper(coalesce(a.sports_league, '')) = 'MLS'
            )
            or (
              query_combined_norm ~ '\m(wnba)\M'
              and upper(coalesce(a.sports_league, '')) = 'WNBA'
            )
            or (
              query_combined_norm ~ '\m(nwsl)\M'
              and upper(coalesce(a.sports_league, '')) = 'NWSL'
            )
            or (
              query_combined_norm ~ '\m(ncaa)\M'
              and upper(coalesce(a.sports_league, '')) = 'NCAA'
            )
          )
        then 0.45
        else 0.0
      end::double precision as sport_team_boost,
      (
        lower(coalesce(a.display_name, '')) ~ ethnicity_audience_regex
        or lower(coalesce(a.name, '')) ~ ethnicity_audience_regex
        or lower(split_part(coalesce(a.hierarchical_context, ''), '|', 1)) ~ ethnicity_audience_regex
      ) as is_ethnicity_audience,
      case
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(nfl|cfp|college football|super bowl|gridiron|tailgating)\M' then 'football'
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(nba|wnba|basketball|march madness|final four|hoops)\M' then 'basketball'
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(mlb|baseball|world series)\M' then 'baseball'
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(nhl|hockey|stanley cup)\M' then 'hockey'
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(mls|nwsl|soccer|fifa|world cup|premier league|la liga|bundesliga)\M' then 'soccer'
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(nascar|indycar|racing|daytona|indy 500)\M' then 'racing'
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(golf|pga|lpga|masters)\M' then 'golf'
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(tennis|atp|wta|us open)\M' then 'tennis'
        when lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''))) ~ '\m(wwe|wrestling|wrestlemania)\M' then 'wrestling'
        else null
      end::text as audience_explicit_sport
    from audiences a
    where a.hierarchical_context_embedding is not null
  ),
  max_lex as (
    select max(s.lex) as raw_max from scored s
  ),
  seasonal as (
    select
      s.id as audience_id,
      coalesce(max(
        case
          when asm.component_type = 'baseline' then coalesce(asm.baseline_weight, 0)
          else 0
        end
      ), 0)::double precision as league_baseline_component,
      coalesce(max(
        case
          when season_quarter is not null and asm.quarter = season_quarter then
            case
              when asm.component_type = 'baseline' then least(0.20, coalesce(asm.baseline_weight, 0))
              when asm.component_type = 'event' then 0.20
              else 0
            end
          else 0
        end
      ), 0)::double precision as quarter_component,
      coalesce(max(
        case
          when asm.component_type = 'event'
            and season_event_keys is not null
            and asm.event_key = any(season_event_keys)
          then least(0.30, coalesce(asm.live_weight, 0))
          else 0
        end
      ), 0)::double precision as event_component
    from scored s
    left join public.audience_seasonal_map asm
      on asm.audience_id = s.id
     and asm.year = resolved_season_year
    group by s.id
  ),
  enriched as (
    select
      s.*,
      case
        when ml.raw_max is null or ml.raw_max = 0 then 0
        else (s.lex / ml.raw_max)
      end::double precision as lex_norm,
      case
        when has_seasonal_intent then
          least(
            0.35,
            greatest(se.league_baseline_component, se.quarter_component) + se.event_component
          )
        else 0
      end::double precision as seasonal_additive
    from scored s
    cross join max_lex ml
    left join seasonal se on se.audience_id = s.id
  )
  select
    e.id,
    e.name,
    e.display_name,
    e.hierarchical_context,
    e.description,
    e.sports_league,
    e.category,
    e.tags,
    e.is_featured,
    e.created_at,
    e.updated_at,
    e.sim as similarity,
    e.lex_norm as lexical_score,
    (
      (
        e.sim * w_semantic +
        e.lex_norm * w_lexical +
        e.exact_boost +
        e.sport_team_boost +
        e.seasonal_additive
      ) * case
        when e.is_ethnicity_audience and not query_is_ethnicity_direct then ethnicity_demotion_multiplier
        else 1.0
      end
    )::double precision as final_score
  from enriched e
  where (
    not require_strict_event_match
    or exists (
      select 1
      from public.audience_seasonal_map asm_filter
      where asm_filter.audience_id = e.id
        and asm_filter.year = resolved_season_year
        and asm_filter.component_type = 'event'
        and asm_filter.event_key = any(season_event_keys)
    )
  )
  and (
    coalesce(array_length(selected_event_sports, 1), 0) = 0
    or e.audience_explicit_sport is null
    or e.audience_explicit_sport = any(selected_event_sports)
  )
  and (
    (
      e.sim * w_semantic +
      e.lex_norm * w_lexical +
      e.exact_boost +
      e.sport_team_boost +
      e.seasonal_additive
    ) * case
      when e.is_ethnicity_audience and not query_is_ethnicity_direct then ethnicity_demotion_multiplier
      else 1.0
    end
  ) >= score_threshold
  order by final_score desc
  limit match_count;
end;
$function$;
