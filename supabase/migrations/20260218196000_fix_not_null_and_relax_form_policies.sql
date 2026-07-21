/*
  # Fix NOT NULL constraints + relax form policies

  The app already captures user identity via the gate (name/role/password). For form submissions:
  - Only `email` is required
  - `looking_for` is optional
  - PMG variant uses company = "PMG" (frontend sets it)

  This migration:
  - Drops NOT NULL constraints on legacy `report_downloads.name/company` if still present
  - Ensures form INSERT policies only require a non-empty email
*/

-- report_downloads: name/company should be optional
ALTER TABLE report_downloads
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN company DROP NOT NULL;

-- report_downloads: relax insert policy to only require email
DROP POLICY IF EXISTS "Allow download form submissions with validation" ON report_downloads;
DROP POLICY IF EXISTS "Anyone can submit download forms" ON report_downloads;
CREATE POLICY "Allow download form submissions with validation"
  ON report_downloads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 0
  );

-- activation_requests: relax insert policy to only require email (looking_for optional)
ALTER TABLE activation_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow activation request submissions with validation" ON activation_requests;
CREATE POLICY "Allow activation request submissions with validation"
  ON activation_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 0
  );

