/*
  # Harden March Madness + College Football Event Mapping

  1. Changes
    - Replaces `refresh_audience_seasonal_map` with additional event-specific post-processing:
      - removes pro/non-college cross-sport rows from `march_madness`
      - removes NFL and non-football rows from college-football events
      - adds back eligible college-football rows via targeted synonym insert

  2. Rationale
    - Media-buyer UX requires event lists to be sport-correct and deterministic.
*/

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
             or exists (
               select 1
               from unnest(coalesce(a.tags, '{}'::text[])) as tag
               where lower(tag) like '%football%'
             )
           )
         )
         or (
           (
             coalesce(a.name, '') ilike '%college%'
             or coalesce(a.description, '') ilike '%college%'
             or coalesce(a.category, '') ilike '%college sports%'
             or coalesce(a.category, '') ilike '%college%'
           )
           and (
             coalesce(a.name, '') ilike '%football%'
             or coalesce(a.description, '') ilike '%football%'
             or coalesce(a.category, '') ilike '%football%'
             or exists (
               select 1
               from unnest(coalesce(a.tags, '{}'::text[])) as tag
               where lower(tag) like '%football%'
             )
           )
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
             or exists (
               select 1
               from unnest(coalesce(a.tags, '{}'::text[])) as tag
               where lower(tag) like '%football%'
             )
           )
         )
         or (
           (
             coalesce(a.name, '') ilike '%college%'
             or coalesce(a.description, '') ilike '%college%'
             or coalesce(a.category, '') ilike '%college sports%'
             or coalesce(a.category, '') ilike '%college%'
           )
           and (
             coalesce(a.name, '') ilike '%football%'
             or coalesce(a.description, '') ilike '%football%'
             or coalesce(a.category, '') ilike '%football%'
             or exists (
               select 1
               from unnest(coalesce(a.tags, '{}'::text[])) as tag
               where lower(tag) like '%football%'
             )
           )
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
     or (
       e.league_key = 'tennis'
       and (
         coalesce(a.sports_league, '') ilike 'ATP'
         or coalesce(a.sports_league, '') ilike 'WTA'
         or coalesce(a.name, '') ilike '%tennis%'
         or coalesce(a.description, '') ilike '%tennis%'
         or coalesce(a.category, '') ilike '%tennis%'
         or exists (
           select 1
           from unnest(coalesce(a.tags, '{}'::text[])) as tag
           where lower(tag) similar to '%(tennis|atp|wta|grand slam|us open)%'
         )
       )
     )
     or (e.league_key = 'nascar' and coalesce(a.sports_league, '') ilike 'NASCAR')
     or (e.league_key = 'wwe' and coalesce(a.sports_league, '') ilike 'WWE')
   );

  -- Keep March Madness strictly college basketball (remove NBA and non-basketball sport bleed).
  delete from public.audience_seasonal_map asm
  using public.audiences a
  where asm.audience_id = a.id
    and asm.year = p_year
    and asm.component_type = 'event'
    and asm.event_key = 'march_madness'
    and (
      lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''), array_to_string(coalesce(a.tags, '{}'::text[]), ' '))) ~ '\m(nba|wnba|nfl|mlb|nhl|mls|nwsl|soccer|fifa|hockey|baseball|football)\M'
      or lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''), array_to_string(coalesce(a.tags, '{}'::text[]), ' '))) !~ '\m(basketball|march madness|final four|ncaa|college)\M'
    );

  -- Remove NFL/pro and other sports from college-football events.
  delete from public.audience_seasonal_map asm
  using public.audiences a
  where asm.audience_id = a.id
    and asm.year = p_year
    and asm.component_type = 'event'
    and asm.event_key in ('cfp_national_championship', 'cfb_rivalry_and_bowls')
    and (
      lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''), array_to_string(coalesce(a.tags, '{}'::text[]), ' '))) ~ '\m(nfl|super bowl|nba|wnba|basketball|march madness|mlb|baseball|nhl|hockey|mls|soccer|fifa|world cup|tennis|golf|nascar)\M'
      or lower(concat_ws(' ', coalesce(a.sports_league, ''), coalesce(a.category, ''), coalesce(a.name, ''), coalesce(a.display_name, ''), coalesce(a.description, ''), array_to_string(coalesce(a.tags, '{}'::text[]), ' '))) !~ '\m(college|ncaa|football|cfp|bowl|rivalry|rose bowl)\M'
    );

  -- Add back qualifying college-football audiences for CFP/Bowls if they were missed.
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
    'rule_synonym'
  from public.audiences a
  join public.seasonal_calendar_events e
    on e.year = p_year
   and e.event_key in ('cfp_national_championship', 'cfb_rivalry_and_bowls')
  cross join lateral (
    select lower(concat_ws(' ',
      coalesce(a.sports_league, ''),
      coalesce(a.category, ''),
      coalesce(a.name, ''),
      coalesce(a.display_name, ''),
      coalesce(a.description, ''),
      array_to_string(coalesce(a.tags, '{}'::text[]), ' ')
    )) as txt
  ) t
  where t.txt ~ '\m(college|ncaa|football|cfp|bowl|rivalry|rose bowl)\M'
    and t.txt !~ '\m(nfl|super bowl|nba|wnba|basketball|march madness|mlb|baseball|nhl|hockey|mls|soccer|fifa|world cup|tennis|golf|nascar)\M'
    and not exists (
      select 1
      from public.audience_seasonal_map existing
      where existing.audience_id = a.id
        and existing.year = p_year
        and existing.component_type = 'event'
        and existing.event_key = e.event_key
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
  )
  and not exists (
    select 1
    from public.audience_seasonal_map existing
    where existing.audience_id = a.id
      and existing.year = p_year
      and existing.component_type = 'event'
      and existing.event_key = e.event_key
  );
end;
$$;

grant execute on function public.refresh_audience_seasonal_map(integer) to service_role;
