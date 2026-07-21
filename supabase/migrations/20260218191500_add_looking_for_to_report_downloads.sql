/*
  # Add "looking_for" checklist to report_downloads

  Stores "what are you looking for?" selections from:
  - Activate Audience modal
  - Latest report download modal
  - Audience list export modal
*/

ALTER TABLE report_downloads
  ADD COLUMN IF NOT EXISTS looking_for text[] NOT NULL DEFAULT '{}';

