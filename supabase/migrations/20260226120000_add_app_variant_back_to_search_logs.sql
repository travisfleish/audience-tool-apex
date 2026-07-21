/*
  # Re-add app_variant to search_logs

  The app variant field was intentionally removed during PII cleanup,
  but it is a non-PII analytics dimension needed for attribution.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'search_logs'
      AND column_name = 'app_variant'
  ) THEN
    ALTER TABLE search_logs ADD COLUMN app_variant text;
  END IF;
END $$;
