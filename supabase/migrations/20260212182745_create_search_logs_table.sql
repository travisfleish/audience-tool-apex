/*
  # Create Search Logs Table

  1. New Tables
    - `search_logs`
      - `id` (uuid, primary key)
      - `query` (text) - the raw search query typed by the user
      - `expanded_query` (text, nullable) - the AI-expanded query used for search
      - `results_count` (integer) - number of results returned
      - `top_result_id` (uuid, nullable) - ID of the first result returned
      - `top_result_name` (text, nullable) - name of the first result
      - `session_id` (text, nullable) - browser session identifier for grouping
      - `created_at` (timestamptz) - when the search was performed

  2. Security
    - Enable RLS on `search_logs` table
    - Add policy for inserting search logs (public access for logging)
    - No read policy for public - only accessible via Supabase dashboard

  3. Indexes
    - Index on created_at for time-based queries
    - Index on query for searching by query text
*/

CREATE TABLE IF NOT EXISTS search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  expanded_query text,
  results_count integer DEFAULT 0,
  top_result_id uuid,
  top_result_name text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for logging"
  ON search_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
