/*
  # Make report_id nullable in report_downloads table

  1. Changes
    - Alter `report_downloads.report_id` to allow NULL values
    - This allows tracking audience list exports that don't have an associated report

  2. Reasoning
    - Audience list exports from the header and notebook don't have a specific report
    - We still want to track these form submissions for analytics
    - The download_source column differentiates between report downloads and audience list exports
*/

ALTER TABLE report_downloads
  ALTER COLUMN report_id DROP NOT NULL;
