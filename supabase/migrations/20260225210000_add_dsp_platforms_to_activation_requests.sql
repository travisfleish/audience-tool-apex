/*
  # Store selected DSP platforms as non-PII metadata

  Preserve multi-select DSP / platform choices submitted from the activation
  request forms while avoiding user-identifying fields.
*/

ALTER TABLE IF EXISTS activation_requests
  ADD COLUMN IF NOT EXISTS dsp_platforms text[];
