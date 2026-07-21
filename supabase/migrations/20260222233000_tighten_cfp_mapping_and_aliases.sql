/*
  # Tighten CFP Mapping And Aliases

  1. Changes
    - Updates `cfp_national_championship` aliases to football-specific phrasing.
    - Tightens `refresh_audience_seasonal_map` logic for `college_football` so generic NCAA/college-sports
      audiences are not included unless football signals are present.

  2. Rationale
    - Prevents basketball/general college audiences from surfacing for CFP seasonal selection.
*/

update public.seasonal_calendar_events
set aliases = array[
  'cfp',
  'cfp national championship',
  'college football playoff national championship',
  'college football championship'
]
where event_key = 'cfp_national_championship'
  and year = 2026;

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
     or (
       lb.league_key = 'college_football'
       and (
         coalesce(a.category, '') ilike '%college football%'
         or (
           coalesce(a.sports_league, '') ilike 'NCAA'
           and (
             coalesce(a.name, '') ilike '%football%'
             or coalesce(a.description, '') ilike '%football%'
             or coalesce(a.category, '') ilike '%football%'
           )
         )
         or exists (
           select 1
           from unnest(coalesce(a.tags, '{}'::text[])) as tag
           where lower(tag) like '%football%'
         )
       )
     )
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
     or (
       e.league_key = 'college_football'
       and (
         coalesce(a.category, '') ilike '%college football%'
         or (
           coalesce(a.sports_league, '') ilike 'NCAA'
           and (
             coalesce(a.name, '') ilike '%football%'
             or coalesce(a.description, '') ilike '%football%'
             or coalesce(a.category, '') ilike '%football%'
           )
         )
         or exists (
           select 1
           from unnest(coalesce(a.tags, '{}'::text[])) as tag
           where lower(tag) like '%football%'
         )
       )
     )
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

grant execute on function public.refresh_audience_seasonal_map(integer) to service_role;
