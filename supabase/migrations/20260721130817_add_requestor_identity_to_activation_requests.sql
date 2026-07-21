/*
  # Track requestor identity on activation_requests

  Restore email + requestor name so Deal Desk / analytics can see who
  submitted each activation / Deal ID request. Existing rows remain null.
*/

ALTER TABLE IF EXISTS activation_requests
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS requestor_name text;

CREATE INDEX IF NOT EXISTS idx_activation_requests_email
  ON activation_requests (email);

CREATE INDEX IF NOT EXISTS idx_activation_requests_created_at_email
  ON activation_requests (created_at DESC, email);
