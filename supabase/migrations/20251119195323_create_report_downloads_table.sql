/*
  # Create report downloads tracking table

  1. New Tables
    - `report_downloads`
      - `id` (uuid, primary key) - Unique identifier for each download record
      - `name` (text) - User's full name
      - `email` (text) - User's email address
      - `company` (text) - User's company name
      - `report_id` (uuid, foreign key) - Reference to the report being downloaded
      - `downloaded_at` (timestamptz) - Timestamp of when the form was submitted

  2. Security
    - Enable RLS on `report_downloads` table
    - Add policy for inserting download records (allow anonymous users to submit)
    - Add policy for authenticated admins to view download records

  3. Indexes
    - Index on email for quick lookups
    - Index on report_id for filtering by report
    - Index on downloaded_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS report_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE report_downloads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert download records (form submissions)
CREATE POLICY "Anyone can submit download forms"
  ON report_downloads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to view all download records (for admin purposes)
CREATE POLICY "Authenticated users can view download records"
  ON report_downloads
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_downloads_email 
  ON report_downloads(email);

CREATE INDEX IF NOT EXISTS idx_report_downloads_report_id 
  ON report_downloads(report_id);

CREATE INDEX IF NOT EXISTS idx_report_downloads_downloaded_at 
  ON report_downloads(downloaded_at DESC);
