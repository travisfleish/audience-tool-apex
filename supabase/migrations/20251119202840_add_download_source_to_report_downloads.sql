/*
  # Add download_source column to report_downloads table

  1. Changes
    - Add `download_source` column (text) to track where the download originated from
      - Values: 'latest_report' or 'audience_list'
      - NOT NULL with default 'latest_report' for backwards compatibility

  2. Notes
    - Existing records will default to 'latest_report'
    - Index added for filtering by download source
*/

-- Add download_source column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_downloads' AND column_name = 'download_source'
  ) THEN
    ALTER TABLE report_downloads 
    ADD COLUMN download_source text NOT NULL DEFAULT 'latest_report';
  END IF;
END $$;

-- Create index for download source
CREATE INDEX IF NOT EXISTS idx_report_downloads_source 
  ON report_downloads(download_source);
