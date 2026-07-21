/*
  # Store multi-audience activation requests

  Add JSONB column to preserve the full audience list when requests
  are submitted from notebook activation (bulk flow).
*/

ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS audiences jsonb;

