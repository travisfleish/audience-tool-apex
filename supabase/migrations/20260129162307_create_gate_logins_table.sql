/*
  # Create Gate Logins Tracking Table

  1. New Tables
    - `gate_logins`
      - `id` (uuid, primary key) - Unique identifier for each login event
      - `client_id` (text, not null) - The client identifier from password lookup
      - `ip_address` (text) - IP address of the login request
      - `user_agent` (text) - Browser user agent string
      - `created_at` (timestamptz) - When the login occurred

  2. Security
    - Enable RLS on `gate_logins` table
    - Add policy for service role to insert records (edge function uses service role)
    - No public read access - admin only via Supabase dashboard

  3. Indexes
    - Index on client_id for filtering by client
    - Index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS gate_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gate_logins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert gate logins"
  ON gate_logins
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read gate logins"
  ON gate_logins
  FOR SELECT
  TO service_role
  USING (true);

CREATE INDEX IF NOT EXISTS idx_gate_logins_client_id ON gate_logins(client_id);
CREATE INDEX IF NOT EXISTS idx_gate_logins_created_at ON gate_logins(created_at DESC);
