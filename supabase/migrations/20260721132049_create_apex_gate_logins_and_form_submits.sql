/*
  # Apex gate login + form submit tracking

  Discrete Apex-only tables (not shared with other app variants).

  1. apex_gate_logins
     - name, email from the Apex seller gate
     - created_at for audit

  2. apex_form_submits
     - requestor identity + brand / inventory / notes
     - deal_payload jsonb for sport / vertical / sub_verticals / moments
     - request_kind defaults to apex_moment_rfp

  Security
  - RLS enabled
  - anon/authenticated may INSERT with basic validation
  - no public SELECT (dashboard / service role only)
*/

CREATE TABLE IF NOT EXISTS apex_gate_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS apex_form_submits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  brand text NOT NULL,
  inventory_channel text NOT NULL,
  notes text,
  request_kind text NOT NULL DEFAULT 'apex_moment_rfp',
  deal_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE apex_gate_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_form_submits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Apex gate login inserts" ON apex_gate_logins;
CREATE POLICY "Allow Apex gate login inserts"
  ON apex_gate_logins
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0
    AND email IS NOT NULL AND length(trim(email)) > 0
  );

DROP POLICY IF EXISTS "Allow Apex form submit inserts" ON apex_form_submits;
CREATE POLICY "Allow Apex form submit inserts"
  ON apex_form_submits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0
    AND email IS NOT NULL AND length(trim(email)) > 0
    AND brand IS NOT NULL AND length(trim(brand)) > 0
    AND inventory_channel IS NOT NULL AND length(trim(inventory_channel)) > 0
  );

CREATE INDEX IF NOT EXISTS idx_apex_gate_logins_created_at
  ON apex_gate_logins (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_apex_gate_logins_email
  ON apex_gate_logins (email);

CREATE INDEX IF NOT EXISTS idx_apex_form_submits_created_at
  ON apex_form_submits (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_apex_form_submits_email
  ON apex_form_submits (email);
