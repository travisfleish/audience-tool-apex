/*
  # Add Audience Name Snapshot To Audience Seasonal Map

  1. Changes
    - Adds `audience_name` column to `audience_seasonal_map`
    - Adds trigger to auto-populate/update `audience_name` from `audiences.name`
    - Backfills existing rows

  2. Rationale
    - Makes seasonal mapping verification easier without extra joins.
    - Keeps `audience_id` as canonical key while storing readable snapshot.
*/

alter table if exists public.audience_seasonal_map
  add column if not exists audience_name text;

create or replace function public.set_audience_seasonal_map_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select a.name
    into new.audience_name
  from public.audiences a
  where a.id = new.audience_id;

  return new;
end;
$$;

drop trigger if exists trg_set_audience_seasonal_map_name on public.audience_seasonal_map;

create trigger trg_set_audience_seasonal_map_name
before insert or update of audience_id
on public.audience_seasonal_map
for each row
execute function public.set_audience_seasonal_map_name();

update public.audience_seasonal_map asm
set audience_name = a.name
from public.audiences a
where a.id = asm.audience_id
  and (asm.audience_name is distinct from a.name);
