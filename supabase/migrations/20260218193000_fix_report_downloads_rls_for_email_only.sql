/*
  # Fix report_downloads RLS policy for current forms

  The current frontend forms only capture:
  - email (required)
  - looking_for (required checklist)
  - report_id (nullable)
  - download_source (text)

  Earlier RLS validation required non-empty name/company which are now optional.
  This migration updates the INSERT policy to match the current schema + UX.
*/

DROP POLICY IF EXISTS "Allow download form submissions with validation" ON report_downloads;
DROP POLICY IF EXISTS "Anyone can submit download forms" ON report_downloads;

CREATE POLICY "Allow download form submissions with validation"
  ON report_downloads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 0
    AND looking_for IS NOT NULL AND coalesce(array_length(looking_for, 1), 0) > 0
  );

