/*
  # Add app_variant and user_role to search_logs

  ## Summary
  Adds two new columns to the search_logs table to improve tracking of search activity:

  1. New Columns
    - `app_variant` (text) - identifies which app generated the search, e.g. "main" or "pmg". Added as the first logical tracking column.
    - `user_role` (text, nullable) - the role entered by the user at login (e.g. "Agency", "Brand"). Stored alongside user_name for richer attribution.

  ## Notes
  - Both columns are nullable to maintain backwards compatibility with existing rows.
  - No RLS changes needed; existing policies on search_logs remain in effect.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_logs' AND column_name = 'app_variant'
  ) THEN
    ALTER TABLE search_logs ADD COLUMN app_variant text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_logs' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE search_logs ADD COLUMN user_role text;
  END IF;
END $$;
