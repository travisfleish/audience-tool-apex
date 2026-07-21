/*
  # Add audience variant tagging

  Maps audiences to app variants (e.g. index-exchange) so each branded
  deployment can show a curated subset without duplicating audience rows.
*/

CREATE TABLE IF NOT EXISTS audience_variants (
  audience_id uuid NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
  variant text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (audience_id, variant)
);

CREATE INDEX IF NOT EXISTS idx_audience_variants_variant
  ON audience_variants(variant);

ALTER TABLE audience_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audience_variants"
  ON audience_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);
