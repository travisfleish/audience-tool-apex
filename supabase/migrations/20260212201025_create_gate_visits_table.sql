/*
  # Create Gate Visits Table

  Tracks every app visit (both new logins and resumed sessions) so we can see
  who is using the app and how often, even if they stay logged in for days.

  1. New Tables
    - `gate_visits`
      - `id` (uuid, primary key)
      - `client_id` (text, not null) - the password/client identifier
      - `user_name` (text) - the name the user entered at login
      - `visit_type` (text, not null) - 'login' for fresh logins, 'session_resume' for returning visits
      - `created_at` (timestamptz) - when the visit occurred

  2. Security
    - Enable RLS on `gate_visits` table
    - Allow anon + authenticated inserts (frontend logs visits directly)
    - No public read access - admin only via Supabase dashboard

  3. Indexes
    - Index on client_id for filtering by client
    - Index on user_name for filtering by user
    - Index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS gate_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  user_name text,
  visit_type text NOT NULL DEFAULT 'login',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gate_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for visit logging"
  ON gate_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_gate_visits_client_id ON gate_visits(client_id);
CREATE INDEX IF NOT EXISTS idx_gate_visits_user_name ON gate_visits(user_name);
CREATE INDEX IF NOT EXISTS idx_gate_visits_created_at ON gate_visits(created_at DESC);
