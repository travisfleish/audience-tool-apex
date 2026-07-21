/*
  # Add INSERT policy for audiences table

  1. Changes
    - Add policy to allow public inserts to audiences table
    - This enables loading data from CSV files
  
  2. Security
    - Allows anon role to insert audiences
    - Maintains existing read-only policy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audiences' 
    AND policyname = 'Allow public insert access to audiences'
  ) THEN
    CREATE POLICY "Allow public insert access to audiences"
      ON audiences
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;
