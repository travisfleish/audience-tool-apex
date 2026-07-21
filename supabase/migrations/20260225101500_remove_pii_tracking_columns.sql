/*
  # Remove persisted PII tracking from analytics/lead tables

  This migration removes PII columns and dependent policies so the database
  no longer stores user identifiers, except search text in search_logs
  (query + expanded_query).
*/

-- Drop policies that reference soon-to-be-removed PII columns.
DROP POLICY IF EXISTS "Allow download form submissions with validation" ON report_downloads;
DROP POLICY IF EXISTS "Anyone can submit download forms" ON report_downloads;
DROP POLICY IF EXISTS "Allow activation request submissions with validation" ON activation_requests;
DROP POLICY IF EXISTS "Allow insert for visit logging" ON gate_visits;
DROP POLICY IF EXISTS "Allow insert for visit logging with validation" ON gate_visits;

-- Remove PII columns from report download tracking.
ALTER TABLE IF EXISTS report_downloads
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS company;

-- Remove PII columns from activation requests.
ALTER TABLE IF EXISTS activation_requests
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS company,
  DROP COLUMN IF EXISTS client_id,
  DROP COLUMN IF EXISTS user_name,
  DROP COLUMN IF EXISTS user_role,
  DROP COLUMN IF EXISTS dsp,
  DROP COLUMN IF EXISTS dsp_seat_id,
  DROP COLUMN IF EXISTS preferred_inventory_channel;

-- Remove PII columns from gate login/visit tracking.
ALTER TABLE IF EXISTS gate_logins
  DROP COLUMN IF EXISTS client_id,
  DROP COLUMN IF EXISTS user_name,
  DROP COLUMN IF EXISTS ip_address,
  DROP COLUMN IF EXISTS user_agent;

ALTER TABLE IF EXISTS gate_visits
  DROP COLUMN IF EXISTS client_id,
  DROP COLUMN IF EXISTS user_name;

-- Keep only search text tracking (plus ids/timestamps) in search_logs.
ALTER TABLE IF EXISTS search_logs
  DROP COLUMN IF EXISTS app_variant,
  DROP COLUMN IF EXISTS user_role,
  DROP COLUMN IF EXISTS user_name,
  DROP COLUMN IF EXISTS session_id,
  DROP COLUMN IF EXISTS results_count,
  DROP COLUMN IF EXISTS top_result_id,
  DROP COLUMN IF EXISTS top_result_name,
  DROP COLUMN IF EXISTS top_result_2_id,
  DROP COLUMN IF EXISTS top_result_2_name,
  DROP COLUMN IF EXISTS top_result_3_id,
  DROP COLUMN IF EXISTS top_result_3_name;

-- Remove request-level identifiers and raw terms from embedding metrics.
ALTER TABLE IF EXISTS embedding_request_metrics
  DROP COLUMN IF EXISTS requester_ip,
  DROP COLUMN IF EXISTS session_id,
  DROP COLUMN IF EXISTS search_term,
  DROP COLUMN IF EXISTS cache_term;

-- Recreate permissive insert policies that no longer depend on PII fields.
CREATE POLICY "Allow report download submissions without PII"
  ON report_downloads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow activation submissions without PII"
  ON activation_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow gate visit logging without identifiers"
  ON gate_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (visit_type IS NOT NULL AND visit_type IN ('login', 'session_resume'));
