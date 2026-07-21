/*
  # Add Top 3 Results to Search Logs

  1. Changes
    - Add columns for 2nd and 3rd results to search_logs table
      - `top_result_2_id` (uuid, nullable) - ID of the second result
      - `top_result_2_name` (text, nullable) - name of the second result
      - `top_result_3_id` (uuid, nullable) - ID of the third result
      - `top_result_3_name` (text, nullable) - name of the third result

  2. Notes
    - Existing top_result_id and top_result_name remain as the first result
    - All new columns are nullable to handle searches with fewer than 3 results
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_logs' AND column_name = 'top_result_2_id'
  ) THEN
    ALTER TABLE search_logs ADD COLUMN top_result_2_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_logs' AND column_name = 'top_result_2_name'
  ) THEN
    ALTER TABLE search_logs ADD COLUMN top_result_2_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_logs' AND column_name = 'top_result_3_id'
  ) THEN
    ALTER TABLE search_logs ADD COLUMN top_result_3_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_logs' AND column_name = 'top_result_3_name'
  ) THEN
    ALTER TABLE search_logs ADD COLUMN top_result_3_name text;
  END IF;
END $$;
