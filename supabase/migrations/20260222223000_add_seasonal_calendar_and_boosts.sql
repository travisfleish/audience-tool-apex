/*
  # Add Seasonal Calendar And Bounded Seasonal Boosts

  1. New Tables
    - seasonal_calendar_events
    - league_season_baselines
    - audience_seasonal_map

  2. New Function
    - refresh_audience_seasonal_map(p_year integer default 2026)

  3. Search Update
    - Extends 5-parameter hybrid_semantic_search overload with optional:
      - season_year
      - season_quarter
      - season_event_keys
    - Applies additive seasonal boost with global cap (<= 0.35)
*/

create table if not exists public.seasonal_calendar_events (
  id bigserial primary key,
  event_key text not null,
  year integer not null,
  tier text not null check (tier in ('A', 'B', 'C')),
  league_key text not null,
  quarter text not null check (quarter in ('Q1', 'Q2', 'Q3', 'Q4')),
  pre_start date not null,
  pre_end date not null,
  live_start date not null,
  live_end date not null,
  post_start date not null,
  post_end date not null,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (event_key, year)
);

create table if not exists public.league_season_baselines (
  id bigserial primary key,
  league_key text not null,
  year integer not null,
  season_start date not null,
  season_end date not null,
  baseline_weight double precision not null check (baseline_weight >= 0 and baseline_weight <= 0.35),
  created_at timestamptz not null default now(),
  unique (league_key, year)
);

create table if not exists public.audience_seasonal_map (
  id bigserial primary key,
  audience_id uuid not null references public.audiences(id) on delete cascade,
  year integer not null,
  component_type text not null check (component_type in ('baseline', 'event')),
  league_key text,
  quarter text check (quarter in ('Q1', 'Q2', 'Q3', 'Q4')),
  event_key text,
  event_tier text check (event_tier in ('A', 'B', 'C')),
  pre_weight double precision check (pre_weight >= 0 and pre_weight <= 0.35),
  live_weight double precision check (live_weight >= 0 and live_weight <= 0.35),
  post_weight double precision check (post_weight >= 0 and post_weight <= 0.35),
  baseline_weight double precision check (baseline_weight >= 0 and baseline_weight <= 0.35),
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  source text not null check (source in ('rule_exact', 'rule_synonym', 'rule_text', 'manual')),
  created_at timestamptz not null default now()
);

create index if not exists idx_seasonal_events_year_key on public.seasonal_calendar_events(year, event_key);
create index if not exists idx_baselines_year_league on public.league_season_baselines(year, league_key);
create index if not exists idx_audience_seasonal_map_audience_year on public.audience_seasonal_map(audience_id, year);
create index if not exists idx_audience_seasonal_map_event on public.audience_seasonal_map(year, event_key);
create index if not exists idx_audience_seasonal_map_quarter on public.audience_seasonal_map(year, quarter);

alter table if exists public.seasonal_calendar_events enable row level security;
alter table if exists public.league_season_baselines enable row level security;
alter table if exists public.audience_seasonal_map enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seasonal_calendar_events'
      and policyname = 'Allow public read seasonal_calendar_events'
  ) then
    create policy "Allow public read seasonal_calendar_events"
      on public.seasonal_calendar_events
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'league_season_baselines'
      and policyname = 'Allow public read league_season_baselines'
  ) then
    create policy "Allow public read league_season_baselines"
      on public.league_season_baselines
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audience_seasonal_map'
      and policyname = 'Allow public read audience_seasonal_map'
  ) then
    create policy "Allow public read audience_seasonal_map"
      on public.audience_seasonal_map
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

insert into public.league_season_baselines (league_key, year, season_start, season_end, baseline_weight)
values
  ('nfl', 2026, date '2026-09-01', date '2026-12-31', 0.12),
  ('college_football', 2026, date '2026-08-20', date '2026-12-31', 0.10),
  ('nba', 2026, date '2026-10-15', date '2026-12-31', 0.08),
  ('nhl', 2026, date '2026-10-01', date '2026-12-31', 0.08),
  ('mlb', 2026, date '2026-03-25', date '2026-09-30', 0.08),
  ('mls', 2026, date '2026-02-20', date '2026-10-20', 0.08),
  ('wnba', 2026, date '2026-05-01', date '2026-09-30', 0.08),
  ('soccer_global', 2026, date '2026-05-01', date '2026-07-31', 0.10)
on conflict (league_key, year) do update
set
  season_start = excluded.season_start,
  season_end = excluded.season_end,
  baseline_weight = excluded.baseline_weight;

insert into public.seasonal_calendar_events (
  event_key, year, tier, league_key, quarter,
  pre_start, pre_end, live_start, live_end, post_start, post_end, aliases
)
values
  ('cfp_national_championship', 2026, 'B', 'college_football', 'Q1', date '2025-12-15', date '2026-01-04', date '2026-01-05', date '2026-01-20', date '2026-01-21', date '2026-01-31', array['cfp','college football championship','national championship']),
  ('nfl_playoffs', 2026, 'B', 'nfl', 'Q1', date '2025-12-15', date '2026-01-09', date '2026-01-10', date '2026-02-10', date '2026-02-11', date '2026-02-20', array['nfl playoffs','wild card','divisional','conference championship']),
  ('super_bowl', 2026, 'A', 'nfl', 'Q1', date '2026-01-10', date '2026-01-31', date '2026-02-01', date '2026-02-15', date '2026-02-16', date '2026-02-28', array['super bowl','big game','halftime show']),
  ('daytona_500', 2026, 'C', 'nascar', 'Q1', date '2026-01-20', date '2026-02-09', date '2026-02-10', date '2026-02-25', date '2026-02-26', date '2026-03-05', array['daytona','daytona 500','nascar opener']),
  ('march_madness', 2026, 'A', 'college_basketball', 'Q1', date '2026-02-20', date '2026-03-14', date '2026-03-15', date '2026-04-07', date '2026-04-08', date '2026-04-18', array['march madness','final four','bracket','selection sunday']),
  ('mlb_opening_day', 2026, 'C', 'mlb', 'Q1', date '2026-03-01', date '2026-03-19', date '2026-03-20', date '2026-04-05', date '2026-04-06', date '2026-04-15', array['opening day','baseball opening day','mlb opener']),
  ('masters', 2026, 'C', 'golf', 'Q2', date '2026-03-20', date '2026-04-04', date '2026-04-05', date '2026-04-15', date '2026-04-16', date '2026-04-25', array['masters','augusta','pga masters']),
  ('wrestlemania', 2026, 'C', 'wwe', 'Q2', date '2026-03-10', date '2026-03-31', date '2026-04-01', date '2026-04-15', date '2026-04-16', date '2026-04-25', array['wrestlemania','wwe mania']),
  ('kentucky_derby', 2026, 'C', 'horse_racing', 'Q2', date '2026-04-15', date '2026-04-30', date '2026-05-01', date '2026-05-10', date '2026-05-11', date '2026-05-20', array['kentucky derby','derby','triple crown']),
  ('indy_500', 2026, 'C', 'indycar', 'Q2', date '2026-05-01', date '2026-05-14', date '2026-05-15', date '2026-05-31', date '2026-06-01', date '2026-06-10', array['indy 500','indianapolis 500']),
  ('nba_playoffs', 2026, 'B', 'nba', 'Q2', date '2026-03-20', date '2026-04-09', date '2026-04-10', date '2026-06-20', date '2026-06-21', date '2026-06-30', array['nba playoffs','the playoffs','postseason']),
  ('nba_finals', 2026, 'A', 'nba', 'Q2', date '2026-05-15', date '2026-05-31', date '2026-06-01', date '2026-06-20', date '2026-06-21', date '2026-06-30', array['nba finals','the finals']),
  ('stanley_cup_finals', 2026, 'B', 'nhl', 'Q2', date '2026-05-10', date '2026-05-31', date '2026-06-01', date '2026-06-25', date '2026-06-26', date '2026-07-05', array['stanley cup','nhl finals','nhl playoffs']),
  ('fifa_world_cup', 2026, 'A', 'soccer_global', 'Q2', date '2026-05-15', date '2026-06-10', date '2026-06-11', date '2026-07-19', date '2026-07-20', date '2026-08-01', array['world cup','fifa world cup','soccer world cup']),
  ('ucl_final', 2026, 'B', 'soccer_global', 'Q2', date '2026-05-01', date '2026-05-19', date '2026-05-20', date '2026-06-05', date '2026-06-06', date '2026-06-15', array['champions league final','ucl final','uefa final']),
  ('wnba_all_star', 2026, 'C', 'wnba', 'Q3', date '2026-06-15', date '2026-06-30', date '2026-07-01', date '2026-07-25', date '2026-07-26', date '2026-08-05', array['wnba all-star','wnba summer','wnba']),
  ('mlb_all_star', 2026, 'C', 'mlb', 'Q3', date '2026-06-20', date '2026-06-30', date '2026-07-01', date '2026-07-25', date '2026-07-26', date '2026-08-05', array['all-star game','mlb all-star','midsummer classic']),
  ('us_open_series', 2026, 'C', 'tennis', 'Q3', date '2026-08-01', date '2026-08-19', date '2026-08-20', date '2026-09-15', date '2026-09-16', date '2026-09-30', array['us open','grand slam tennis']),
  ('nfl_kickoff', 2026, 'A', 'nfl', 'Q3', date '2026-08-15', date '2026-08-31', date '2026-09-01', date '2026-09-20', date '2026-09-21', date '2026-09-30', array['nfl kickoff','football is back','week 1']),
  ('college_football_kickoff', 2026, 'B', 'college_football', 'Q3', date '2026-08-01', date '2026-08-19', date '2026-08-20', date '2026-09-20', date '2026-09-21', date '2026-09-30', array['college football kickoff','week zero','cfb kickoff']),
  ('wnba_playoffs', 2026, 'B', 'wnba', 'Q3', date '2026-08-15', date '2026-08-31', date '2026-09-01', date '2026-10-15', date '2026-10-16', date '2026-10-31', array['wnba playoffs','wnba finals','wnba postseason']),
  ('mlb_postseason', 2026, 'B', 'mlb', 'Q4', date '2026-09-15', date '2026-09-30', date '2026-10-01', date '2026-11-05', date '2026-11-06', date '2026-11-20', array['mlb playoffs','postseason','pennant race']),
  ('world_series', 2026, 'A', 'mlb', 'Q4', date '2026-10-01', date '2026-10-19', date '2026-10-20', date '2026-11-05', date '2026-11-06', date '2026-11-15', array['world series','fall classic']),
  ('nba_opening_week', 2026, 'C', 'nba', 'Q4', date '2026-10-01', date '2026-10-14', date '2026-10-15', date '2026-11-05', date '2026-11-06', date '2026-11-15', array['nba opening night','nba opener','nba start']),
  ('nhl_opening_week', 2026, 'C', 'nhl', 'Q4', date '2026-09-15', date '2026-09-30', date '2026-10-01', date '2026-10-25', date '2026-10-26', date '2026-11-05', array['nhl opener','hockey is back','nhl start']),
  ('mls_playoffs', 2026, 'B', 'mls', 'Q4', date '2026-10-01', date '2026-10-19', date '2026-10-20', date '2026-12-10', date '2026-12-11', date '2026-12-20', array['mls playoffs','mls cup','mls final']),
  ('nwsl_playoffs', 2026, 'B', 'nwsl', 'Q4', date '2026-10-01', date '2026-10-19', date '2026-10-20', date '2026-11-30', date '2026-12-01', date '2026-12-10', array['nwsl playoffs','nwsl championship','nwsl final']),
  ('cfb_rivalry_and_bowls', 2026, 'B', 'college_football', 'Q4', date '2026-11-01', date '2026-11-14', date '2026-11-15', date '2026-12-31', date '2027-01-01', date '2027-01-15', array['rivalry week','conference championship','bowl season']),
  ('nfl_regular_season_peak', 2026, 'A', 'nfl', 'Q4', date '2026-09-01', date '2026-09-30', date '2026-10-01', date '2026-12-31', date '2027-01-01', date '2027-01-15', array['nfl season','football sunday','playoff push'])
on conflict (event_key, year) do update
set
  tier = excluded.tier,
  league_key = excluded.league_key,
  quarter = excluded.quarter,
  pre_start = excluded.pre_start,
  pre_end = excluded.pre_end,
  live_start = excluded.live_start,
  live_end = excluded.live_end,
  post_start = excluded.post_start,
  post_end = excluded.post_end,
  aliases = excluded.aliases;

create or replace function public.refresh_audience_seasonal_map(p_year integer default 2026)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.audience_seasonal_map
  where year = p_year
    and source in ('rule_exact', 'rule_synonym', 'rule_text');

  insert into public.audience_seasonal_map (
    audience_id, year, component_type, league_key, baseline_weight, confidence, source
  )
  select
    a.id,
    p_year,
    'baseline',
    lb.league_key,
    lb.baseline_weight,
    'high',
    'rule_exact'
  from public.audiences a
  join public.league_season_baselines lb
    on lb.year = p_year
   and (
     (lb.league_key = 'nfl' and (coalesce(a.sports_league, '') ilike 'NFL' or coalesce(a.category, '') ilike '%football%'))
     or (lb.league_key = 'college_football' and (coalesce(a.sports_league, '') ilike 'NCAA' or coalesce(a.category, '') ilike '%college sports%'))
     or (lb.league_key = 'nba' and coalesce(a.sports_league, '') ilike 'NBA')
     or (lb.league_key = 'nhl' and coalesce(a.sports_league, '') ilike 'NHL')
     or (lb.league_key = 'mlb' and coalesce(a.sports_league, '') ilike 'MLB')
     or (lb.league_key = 'mls' and coalesce(a.sports_league, '') ilike 'MLS')
     or (lb.league_key = 'wnba' and coalesce(a.sports_league, '') ilike 'WNBA')
     or (lb.league_key = 'soccer_global' and (
       coalesce(a.sports_league, '') ilike 'Premier League'
       or coalesce(a.sports_league, '') ilike 'La Liga'
       or coalesce(a.sports_league, '') ilike 'Bundesliga'
       or coalesce(a.sports_league, '') ilike 'NWSL'
       or coalesce(a.category, '') ilike '%soccer%'
       or coalesce(a.category, '') ilike '%international sports%'
     ))
   );

  insert into public.audience_seasonal_map (
    audience_id, year, component_type, league_key, quarter, event_key, event_tier,
    pre_weight, live_weight, post_weight, confidence, source
  )
  select
    a.id,
    p_year,
    'event',
    e.league_key,
    e.quarter,
    e.event_key,
    e.tier,
    case e.tier when 'A' then 0.20 when 'B' then 0.16 else 0.10 end as pre_weight,
    case e.tier when 'A' then 0.28 when 'B' then 0.22 else 0.14 end as live_weight,
    case e.tier when 'A' then 0.10 when 'B' then 0.08 else 0.05 end as post_weight,
    'high',
    'rule_exact'
  from public.audiences a
  join public.seasonal_calendar_events e
    on e.year = p_year
   and (
     (e.league_key = 'nfl' and (coalesce(a.sports_league, '') ilike 'NFL' or coalesce(a.category, '') ilike '%football%'))
     or (e.league_key = 'college_football' and (coalesce(a.sports_league, '') ilike 'NCAA' or coalesce(a.category, '') ilike '%college sports%'))
     or (e.league_key = 'college_basketball' and (coalesce(a.sports_league, '') ilike 'NCAA' or coalesce(a.category, '') ilike '%college sports%' or coalesce(a.category, '') ilike '%basketball%'))
     or (e.league_key = 'nba' and coalesce(a.sports_league, '') ilike 'NBA')
     or (e.league_key = 'nhl' and coalesce(a.sports_league, '') ilike 'NHL')
     or (e.league_key = 'mlb' and coalesce(a.sports_league, '') ilike 'MLB')
     or (e.league_key = 'mls' and coalesce(a.sports_league, '') ilike 'MLS')
     or (e.league_key = 'nwsl' and coalesce(a.sports_league, '') ilike 'NWSL')
     or (e.league_key = 'wnba' and coalesce(a.sports_league, '') ilike 'WNBA')
     or (e.league_key = 'soccer_global' and (
       coalesce(a.category, '') ilike '%soccer%'
       or coalesce(a.category, '') ilike '%international sports%'
       or coalesce(a.sports_league, '') ilike 'Premier League'
       or coalesce(a.sports_league, '') ilike 'La Liga'
       or coalesce(a.sports_league, '') ilike 'Bundesliga'
     ))
     or (e.league_key = 'golf' and (coalesce(a.sports_league, '') ilike 'PGA' or coalesce(a.sports_league, '') ilike 'LPGA'))
     or (e.league_key = 'tennis' and coalesce(a.category, '') ilike '%tennis%')
     or (e.league_key = 'nascar' and coalesce(a.sports_league, '') ilike 'NASCAR')
     or (e.league_key = 'wwe' and coalesce(a.sports_league, '') ilike 'WWE')
   );

  insert into public.audience_seasonal_map (
    audience_id, year, component_type, league_key, quarter, event_key, event_tier,
    pre_weight, live_weight, post_weight, confidence, source
  )
  select
    a.id,
    p_year,
    'event',
    'soccer_global',
    e.quarter,
    e.event_key,
    e.tier,
    0.18,
    0.24,
    0.08,
    'medium',
    'rule_synonym'
  from public.audiences a
  join public.seasonal_calendar_events e
    on e.year = p_year and e.event_key = 'fifa_world_cup'
  where (
    coalesce(a.category, '') ilike '%retail%'
    or coalesce(a.category, '') ilike '%apparel%'
    or coalesce(a.category, '') ilike '%live entertainment%'
    or exists (
      select 1
      from unnest(coalesce(a.tags, '{}'::text[])) as tag
      where lower(tag) similar to '%(retail|shop|apparel|gear|stadium|travel|tourism)%'
    )
  );
end;
$$;

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
  ethnicity_demotion_multiplier constant double precision := 0.40;
  ethnicity_query_regex constant text := '\m(african[ -]?american|asian|hispanic|latino|latina|latinx)\M';
  ethnicity_audience_regex constant text := '\m(african[ -]?american|asian|hispanic|latino|latina|latinx)\M';
  query_is_ethnicity_direct boolean;
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

  query_is_ethnicity_direct := lower(raw_query_text) ~ ethnicity_query_regex;

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
      (
        lower(coalesce(a.display_name, '')) ~ ethnicity_audience_regex
        or lower(coalesce(a.name, '')) ~ ethnicity_audience_regex
        or lower(split_part(coalesce(a.hierarchical_context, ''), '|', 1)) ~ ethnicity_audience_regex
      ) as is_ethnicity_audience
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
        e.seasonal_additive
      ) * case
        when e.is_ethnicity_audience and not query_is_ethnicity_direct then ethnicity_demotion_multiplier
        else 1.0
      end
    )::double precision as final_score
  from enriched e
  where (
    (
      e.sim * w_semantic +
      e.lex_norm * w_lexical +
      e.exact_boost +
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

grant execute on function public.refresh_audience_seasonal_map(integer) to service_role;
