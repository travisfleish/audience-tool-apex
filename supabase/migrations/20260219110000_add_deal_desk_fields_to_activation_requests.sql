/*
  # Add deal desk fields to activation_requests

  Store Get Started request details in dedicated columns so Deal Desk
  workflows do not need to parse these values from notes.
*/

ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS dsp text,
  ADD COLUMN IF NOT EXISTS dsp_seat_id text,
  ADD COLUMN IF NOT EXISTS preferred_inventory_channel text;

