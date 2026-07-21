/*
  # backfill_audience_hierarchical_context

  Called after bulk audience loads to set `hierarchical_context` from `reverse_hierarchy(name)`,
  which in turn allows `search_vector` (trigger) to index full path context.
*/

CREATE OR REPLACE FUNCTION public.backfill_audience_hierarchical_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.audiences
  SET hierarchical_context = public.reverse_hierarchy(name)
  WHERE name IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.backfill_audience_hierarchical_context() TO service_role;
