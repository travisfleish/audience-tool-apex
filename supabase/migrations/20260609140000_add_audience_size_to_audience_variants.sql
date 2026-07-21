/*
  # Add audience size to audience_variants

  Stores variant-specific reach counts (e.g. Index Exchange segment sizes).
*/

ALTER TABLE audience_variants
  ADD COLUMN IF NOT EXISTS audience_size bigint;

COMMENT ON COLUMN audience_variants.audience_size IS
  'Estimated reachable audience count for this variant (e.g. from partner CSV export).';
