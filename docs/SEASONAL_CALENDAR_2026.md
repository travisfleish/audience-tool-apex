# Seasonal Calendar 2026

This document is the source of truth for seasonal intent mapping in search.
It is intentionally planner-friendly: quarter-first, then league season baselines and tentpole windows.

## Scope

- Primary: U.S. sports planning calendar.
- Included global tentpoles: FIFA World Cup and UEFA Champions League Final.
- Purpose: map query intents (`q1`, `super bowl`, `march madness`, etc.) to audience boosts in a deterministic way.
- Priority principle: do not equate inventory volume with importance; prioritize spend-concentrated planner intent around tentpoles.

## Quarter Definitions

- `Q1`: `2026-01-01` to `2026-03-31`
- `Q2`: `2026-04-01` to `2026-06-30`
- `Q3`: `2026-07-01` to `2026-09-30`
- `Q4`: `2026-10-01` to `2026-12-31`

## League Season Baselines

League baselines are always-on seasonal context windows with low/moderate weight.
They represent planning relevance across the broader season and are overlaid by event spikes.

- `nfl_season_baseline`
  - Season window: `2026-09-01` to `2026-12-31`
  - Baseline weight: `0.12`
- `college_football_season_baseline`
  - Season window: `2026-08-20` to `2026-12-31`
  - Baseline weight: `0.10`
- `nba_season_baseline`
  - Season window: `2026-10-15` to `2026-12-31`
  - Baseline weight: `0.08`
- `nhl_season_baseline`
  - Season window: `2026-10-01` to `2026-12-31`
  - Baseline weight: `0.08`
- `mlb_season_baseline`
  - Season window: `2026-03-25` to `2026-09-30`
  - Baseline weight: `0.08`
- `mls_season_baseline`
  - Season window: `2026-02-20` to `2026-10-20`
  - Baseline weight: `0.08`
- `wnba_season_baseline`
  - Season window: `2026-05-01` to `2026-09-30`
  - Baseline weight: `0.08`
- `soccer_global_baseline`
  - Season window: `2026-05-01` to `2026-07-31`
  - Baseline weight: `0.10`

## Seasonal Weight Model

Use a league-season baseline + tentpole overlay model so ranking reflects spend concentration, not only event count.

- `league_baseline_weight`: low/moderate relevance over broader season windows.
- `pre_window_weight`: planning/build-up period before event starts.
- `live_window_weight`: event active period.
- `post_window_weight`: immediate cool-down and recap period.

Recommended defaults:

- `league_baseline_weight = 0.08` to `0.12` by league
- `pre_window_weight = 0.20`
- `live_window_weight = 0.45`
- `post_window_weight = 0.10`
- `quarter_weight = 0.20` for quarter-only queries (without explicit event)

Tier guidance (spend concentration):

- Tier A (National Spend Tentpoles): `super_bowl`, `fifa_world_cup`, `march_madness`, `nba_finals`, `world_series`, `nfl_kickoff`, `nfl_regular_season_peak`
- Tier B (Playoffs and major windows): `nba_playoffs`, `stanley_cup_finals`, `mlb_postseason`, `cfp_national_championship`, `cfb_rivalry_and_bowls`, `mls_playoffs`, `wnba_playoffs`, `nwsl_playoffs`
- Tier C (niche or optional): `daytona_500`, `indy_500`, `kentucky_derby` (and similar niche spikes if present)

Guardrails:

- Global cap: seasonal additive score must be `<= 0.35`.
- Prevent double-boost runaway: use bounded composition such as
  - `seasonal_additive = min(0.35, max(league_baseline_component, quarter_component) + event_component)`
  - and clamp each component to its configured max by tier.

## Quarter Intent Aliases

Use these aliases in query enrichment:

- `q1`: `q1`, `quarter 1`, `first quarter`, `jan-mar`, `winter`, `early year`
- `q2`: `q2`, `quarter 2`, `second quarter`, `apr-jun`, `spring`
- `q3`: `q3`, `quarter 3`, `third quarter`, `jul-sep`, `summer`
- `q4`: `q4`, `quarter 4`, `fourth quarter`, `oct-dec`, `holiday season`, `year-end`

## Event Calendar (2026)

Dates are operational windows for audience planning and ranking.
Where official schedules can shift, windows are intentionally conservative.

### Q1 (Jan-Mar)

- `cfp_national_championship`
  - Tier: B
  - League: College Football
  - Live window: `2026-01-05` to `2026-01-20`
  - Pre window: `2025-12-15` to `2026-01-04`
  - Post window: `2026-01-21` to `2026-01-31`
  - Aliases: `cfp`, `college football championship`, `national championship`

- `nfl_playoffs`
  - Tier: B
  - League: NFL
  - Live window: `2026-01-10` to `2026-02-10`
  - Pre window: `2025-12-15` to `2026-01-09`
  - Post window: `2026-02-11` to `2026-02-20`
  - Aliases: `nfl playoffs`, `wild card`, `divisional`, `conference championship`

- `super_bowl`
  - Tier: A
  - League: NFL
  - Live window: `2026-02-01` to `2026-02-15`
  - Pre window: `2026-01-10` to `2026-01-31`
  - Post window: `2026-02-16` to `2026-02-28`
  - Aliases: `super bowl`, `big game`, `halftime show`

- `daytona_500`
  - Tier: C
  - League: NASCAR
  - Live window: `2026-02-10` to `2026-02-25`
  - Pre window: `2026-01-20` to `2026-02-09`
  - Post window: `2026-02-26` to `2026-03-05`
  - Aliases: `daytona`, `daytona 500`, `nascar opener`

- `march_madness`
  - Tier: A
  - League: NCAA Basketball
  - Live window: `2026-03-15` to `2026-04-07`
  - Pre window: `2026-02-20` to `2026-03-14`
  - Post window: `2026-04-08` to `2026-04-18`
  - Aliases: `march madness`, `final four`, `bracket`, `selection sunday`

- `mlb_opening_day`
  - League: MLB
  - Live window: `2026-03-20` to `2026-04-05`
  - Pre window: `2026-03-01` to `2026-03-19`
  - Post window: `2026-04-06` to `2026-04-15`
  - Aliases: `opening day`, `baseball opening day`, `mlb opener`

### Q2 (Apr-Jun)

- `masters`
  - League: Golf
  - Live window: `2026-04-05` to `2026-04-15`
  - Pre window: `2026-03-20` to `2026-04-04`
  - Post window: `2026-04-16` to `2026-04-25`
  - Aliases: `masters`, `augusta`, `pga masters`

- `wrestlemania`
  - League: WWE
  - Live window: `2026-04-01` to `2026-04-15`
  - Pre window: `2026-03-10` to `2026-03-31`
  - Post window: `2026-04-16` to `2026-04-25`
  - Aliases: `wrestlemania`, `wwe mania`

- `kentucky_derby`
  - Tier: C
  - League: Horse Racing
  - Live window: `2026-05-01` to `2026-05-10`
  - Pre window: `2026-04-15` to `2026-04-30`
  - Post window: `2026-05-11` to `2026-05-20`
  - Aliases: `kentucky derby`, `derby`, `triple crown`

- `indy_500`
  - Tier: C
  - League: IndyCar
  - Live window: `2026-05-15` to `2026-05-31`
  - Pre window: `2026-05-01` to `2026-05-14`
  - Post window: `2026-06-01` to `2026-06-10`
  - Aliases: `indy 500`, `indianapolis 500`

- `nba_playoffs`
  - Tier: B
  - League: NBA
  - Live window: `2026-04-10` to `2026-06-20`
  - Pre window: `2026-03-20` to `2026-04-09`
  - Post window: `2026-06-21` to `2026-06-30`
  - Aliases: `nba playoffs`, `the playoffs`, `postseason`

- `nba_finals`
  - Tier: A
  - League: NBA
  - Live window: `2026-06-01` to `2026-06-20`
  - Pre window: `2026-05-15` to `2026-05-31`
  - Post window: `2026-06-21` to `2026-06-30`
  - Aliases: `nba finals`, `the finals`

- `stanley_cup_finals`
  - Tier: B
  - League: NHL
  - Live window: `2026-06-01` to `2026-06-25`
  - Pre window: `2026-05-10` to `2026-05-31`
  - Post window: `2026-06-26` to `2026-07-05`
  - Aliases: `stanley cup`, `nhl finals`, `nhl playoffs`

- `fifa_world_cup`
  - Tier: A
  - League: International Soccer
  - Live window: `2026-06-11` to `2026-07-19`
  - Pre window: `2026-05-15` to `2026-06-10`
  - Post window: `2026-07-20` to `2026-08-01`
  - Aliases: `world cup`, `fifa world cup`, `soccer world cup`
  - Broader mapping note: allow additive mapping beyond soccer to `stadium/live event`, `apparel & gear`, and `retail/shoppers` audiences when confidence is medium+; still enforce global additive cap.

- `ucl_final`
  - League: UEFA Champions League
  - Live window: `2026-05-20` to `2026-06-05`
  - Pre window: `2026-05-01` to `2026-05-19`
  - Post window: `2026-06-06` to `2026-06-15`
  - Aliases: `champions league final`, `ucl final`, `uefa final`

### Q3 (Jul-Sep)

- `wnba_all_star`
  - League: WNBA
  - Live window: `2026-07-01` to `2026-07-25`
  - Pre window: `2026-06-15` to `2026-06-30`
  - Post window: `2026-07-26` to `2026-08-05`
  - Aliases: `wnba all-star`, `wnba summer`, `wnba`

- `mlb_all_star`
  - League: MLB
  - Live window: `2026-07-01` to `2026-07-25`
  - Pre window: `2026-06-20` to `2026-06-30`
  - Post window: `2026-07-26` to `2026-08-05`
  - Aliases: `all-star game`, `mlb all-star`, `midsummer classic`

- `us_open_series`
  - League: Tennis
  - Live window: `2026-08-20` to `2026-09-15`
  - Pre window: `2026-08-01` to `2026-08-19`
  - Post window: `2026-09-16` to `2026-09-30`
  - Aliases: `us open`, `grand slam tennis`

- `nfl_kickoff`
  - Tier: A
  - League: NFL
  - Live window: `2026-09-01` to `2026-09-20`
  - Pre window: `2026-08-15` to `2026-08-31`
  - Post window: `2026-09-21` to `2026-09-30`
  - Aliases: `nfl kickoff`, `football is back`, `week 1`

- `college_football_kickoff`
  - League: College Football
  - Live window: `2026-08-20` to `2026-09-20`
  - Pre window: `2026-08-01` to `2026-08-19`
  - Post window: `2026-09-21` to `2026-09-30`
  - Aliases: `college football kickoff`, `week zero`, `cfb kickoff`

- `wnba_playoffs`
  - Tier: B
  - League: WNBA
  - Live window: `2026-09-01` to `2026-10-15`
  - Pre window: `2026-08-15` to `2026-08-31`
  - Post window: `2026-10-16` to `2026-10-31`
  - Aliases: `wnba playoffs`, `wnba finals`, `wnba postseason`

### Q4 (Oct-Dec)

- `mlb_postseason`
  - Tier: B
  - League: MLB
  - Live window: `2026-10-01` to `2026-11-05`
  - Pre window: `2026-09-15` to `2026-09-30`
  - Post window: `2026-11-06` to `2026-11-20`
  - Aliases: `mlb playoffs`, `postseason`, `pennant race`

- `world_series`
  - Tier: A
  - League: MLB
  - Live window: `2026-10-20` to `2026-11-05`
  - Pre window: `2026-10-01` to `2026-10-19`
  - Post window: `2026-11-06` to `2026-11-15`
  - Aliases: `world series`, `fall classic`

- `nba_opening_week`
  - League: NBA
  - Live window: `2026-10-15` to `2026-11-05`
  - Pre window: `2026-10-01` to `2026-10-14`
  - Post window: `2026-11-06` to `2026-11-15`
  - Aliases: `nba opening night`, `nba opener`, `nba start`

- `nhl_opening_week`
  - League: NHL
  - Live window: `2026-10-01` to `2026-10-25`
  - Pre window: `2026-09-15` to `2026-09-30`
  - Post window: `2026-10-26` to `2026-11-05`
  - Aliases: `nhl opener`, `hockey is back`, `nhl start`

- `mls_playoffs`
  - Tier: B
  - League: MLS
  - Live window: `2026-10-20` to `2026-12-10`
  - Pre window: `2026-10-01` to `2026-10-19`
  - Post window: `2026-12-11` to `2026-12-20`
  - Aliases: `mls playoffs`, `mls cup`, `mls final`

- `nwsl_playoffs`
  - Tier: B
  - League: NWSL
  - Live window: `2026-10-20` to `2026-11-30`
  - Pre window: `2026-10-01` to `2026-10-19`
  - Post window: `2026-12-01` to `2026-12-10`
  - Aliases: `nwsl playoffs`, `nwsl championship`, `nwsl final`

- `cfb_rivalry_and_bowls`
  - Tier: B
  - League: College Football
  - Live window: `2026-11-15` to `2026-12-31`
  - Pre window: `2026-11-01` to `2026-11-14`
  - Post window: `2027-01-01` to `2027-01-15`
  - Aliases: `rivalry week`, `conference championship`, `bowl season`

- `nfl_regular_season_peak`
  - Tier: A
  - League: NFL
  - Live window: `2026-10-01` to `2026-12-31`
  - Pre window: `2026-09-01` to `2026-09-30`
  - Post window: `2027-01-01` to `2027-01-15`
  - Aliases: `nfl season`, `football sunday`, `playoff push`

## Mapping Logic (Deterministic First)

Use this priority order when assigning audiences to league baselines, quarters, and events:

1. `sports_league` exact match to event league.
2. `category` exact match or normalized synonym match.
3. `tags` overlap with event aliases.
4. `display_name` and `description` token overlap with event aliases.

Apply mappings as:

- baseline first (`league_baseline_weight`),
- then quarter intent (`quarter_weight`),
- then event overlay (`pre/live/post` by tier).

Confidence levels:

- `high`: league exact match.
- `medium`: category or strong tag match.
- `low`: text-only match (requires review if weight > 0.20).

Suggested persisted fields in mapping table:

- `audience_id`
- `year`
- `quarter`
- `league_key`
- `event_key`
- `event_tier`
- `pre_weight`
- `live_weight`
- `post_weight`
- `baseline_weight`
- `confidence`
- `source` (`rule_exact`, `rule_synonym`, `rule_text`, `manual`)

## Example: NFL + Super Bowl

- NFL audiences should map to:
  - `nfl_season_baseline` plus `nfl_regular_season_peak` in `Q4` (high confidence).
  - `nfl_playoffs` and `super_bowl` in `Q1` (high confidence).
- This is why both `Q4 NFL` and `Q1 NFL` can rank strongly, with `Super Bowl` queries peaking in the event live window.

## Operational Notes

- Revisit this calendar monthly during 2026 for official schedule adjustments.
- Keep event keys stable after launch and year-agnostic (for example `super_bowl`, not `super_bowl_2026`); store year separately.
- If an event date changes, update windows in this document first, then propagate to seed SQL and enrichment intents.
- Seasonal effects are additive-only and bounded by the global cap to preserve core semantic/lexical ranking quality.
