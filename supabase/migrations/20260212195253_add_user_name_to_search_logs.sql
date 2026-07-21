/*
  # Add User Name to Search Logs Table

  1. Changes
    - Add `user_name` column to `search_logs` table
      - `user_name` (text) - The name of the user who performed the search

  2. Purpose
    - Track which users are performing specific searches during pressure testing
    - Enable analysis of search patterns by individual users
*/

ALTER TABLE search_logs 
ADD COLUMN IF NOT EXISTS user_name text;

CREATE INDEX IF NOT EXISTS idx_search_logs_user_name ON search_logs(user_name);
