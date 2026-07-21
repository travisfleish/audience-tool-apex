/*
  # Add User Name to Gate Logins Table

  1. Changes
    - Add `user_name` column to `gate_logins` table
      - `user_name` (text) - The name provided by the user at login

  2. Purpose
    - Enable tracking of which users are performing searches during pressure testing
    - Associates search activity with specific named users for analytics
*/

ALTER TABLE gate_logins 
ADD COLUMN IF NOT EXISTS user_name text;

CREATE INDEX IF NOT EXISTS idx_gate_logins_user_name ON gate_logins(user_name);
