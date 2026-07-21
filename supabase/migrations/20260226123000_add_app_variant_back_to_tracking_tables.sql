/*
  # Re-add app_variant to tracking tables

  Restores app-level attribution metadata for non-PII analytics tables.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'gate_logins'
      AND column_name = 'app_variant'
  ) THEN
    ALTER TABLE gate_logins ADD COLUMN app_variant text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'gate_visits'
      AND column_name = 'app_variant'
  ) THEN
    ALTER TABLE gate_visits ADD COLUMN app_variant text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'query_embedding_cache'
      AND column_name = 'app_variant'
  ) THEN
    ALTER TABLE query_embedding_cache ADD COLUMN app_variant text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'report_downloads'
      AND column_name = 'app_variant'
  ) THEN
    ALTER TABLE report_downloads ADD COLUMN app_variant text;
  END IF;
END $$;
