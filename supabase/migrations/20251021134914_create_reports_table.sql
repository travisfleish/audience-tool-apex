/*
  # Create reports/collateral table

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `title` (text) - Title of the report/collateral
      - `description` (text) - Brief description
      - `preview_image_url` (text) - URL to preview image
      - `download_url` (text) - URL to download the report/PDF
      - `published_date` (timestamptz) - When the report was published
      - `is_featured` (boolean) - Whether to show this report
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `reports` table
    - Add policy for public read access (reports are publicly viewable)
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  preview_image_url text NOT NULL,
  download_url text NOT NULL,
  published_date timestamptz DEFAULT now(),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports are publicly readable"
  ON reports
  FOR SELECT
  TO anon, authenticated
  USING (true);
