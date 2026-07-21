/*
  # Store per-platform DSP CID mappings

  Preserve one DSP CID per selected DSP/platform for activation requests.
*/

ALTER TABLE IF EXISTS activation_requests
  ADD COLUMN IF NOT EXISTS dsp_seat_ids jsonb;
