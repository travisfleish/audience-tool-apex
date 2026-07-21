/*
  # Fix always-true RLS policies

  Replaces overly permissive RLS policies with properly scoped ones.

  1. Audiences Table
    - Removed anon INSERT and UPDATE policies (data loading uses
      service_role which bypasses RLS, so anon never needs write access)

  2. Gate Visits Table
    - Replaced open INSERT with a policy that validates required fields
      (client_id and visit_type must be non-empty)

  3. Report Downloads Table
    - Replaced open INSERT with a policy that validates required fields
      (name, email, and company must be non-empty)

  4. Search Logs Table
    - Replaced open INSERT with a policy that validates the query field
      is non-empty
*/

-- audiences: remove unrestricted anon write access
DROP POLICY IF EXISTS "Allow public insert access to audiences" ON audiences;
DROP POLICY IF EXISTS "Allow public update access to audiences" ON audiences;

-- gate_visits: require non-empty required fields
DROP POLICY IF EXISTS "Allow insert for visit logging" ON gate_visits;
CREATE POLICY "Allow insert for visit logging with validation"
  ON gate_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    client_id IS NOT NULL AND length(trim(client_id)) > 0
    AND visit_type IS NOT NULL AND visit_type IN ('login', 'session_resume')
  );

-- report_downloads: require non-empty contact info
DROP POLICY IF EXISTS "Anyone can submit download forms" ON report_downloads;
CREATE POLICY "Allow download form submissions with validation"
  ON report_downloads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0
    AND email IS NOT NULL AND length(trim(email)) > 0
    AND company IS NOT NULL AND length(trim(company)) > 0
  );

-- search_logs: require non-empty query
DROP POLICY IF EXISTS "Allow public insert for logging" ON search_logs;
CREATE POLICY "Allow search logging with validation"
  ON search_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    query IS NOT NULL AND length(trim(query)) > 0
  );
