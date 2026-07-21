/*
  # Create activation_requests table (if missing) + RLS

  Some activation request forms should write to `activation_requests`, not `report_downloads`.
  This migration creates the table if it doesn't exist and ensures required columns/policies exist.
*/

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS activation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  looking_for text[] NOT NULL DEFAULT '{}',
  notes text,
  request_kind text NOT NULL DEFAULT 'audience', -- 'audience' | 'moment'
  audience_id uuid,
  audience_name text,
  audience_display_name text,
  moment_id text,
  moment_name text,
  app_variant text,
  client_id text,
  user_name text,
  user_role text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- If the table already existed (created manually), add any missing columns.
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS looking_for text[] NOT NULL DEFAULT '{}';
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS request_kind text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS audience_id uuid;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS audience_name text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS audience_display_name text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS moment_id text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS moment_name text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS app_variant text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS client_id text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS user_name text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS user_role text;
ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Enable RLS and allow anonymous inserts with validation.
ALTER TABLE activation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow activation request submissions with validation" ON activation_requests;
CREATE POLICY "Allow activation request submissions with validation"
  ON activation_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND length(trim(email)) > 0
    AND looking_for IS NOT NULL AND coalesce(array_length(looking_for, 1), 0) > 0
  );

-- No public read policy (dashboard/service role only).

CREATE INDEX IF NOT EXISTS idx_activation_requests_email ON activation_requests(email);
CREATE INDEX IF NOT EXISTS idx_activation_requests_created_at ON activation_requests(created_at DESC);

