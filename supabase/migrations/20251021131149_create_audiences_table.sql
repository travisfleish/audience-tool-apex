/*
  # Create Audiences Table

  1. New Tables
    - `audiences`
      - `id` (uuid, primary key) - Unique identifier for each audience
      - `name` (text) - Full audience name (e.g., "Genius Sports SL NHL Holiday Shoppers")
      - `description` (text) - One-line description or AI summary
      - `category` (text) - Primary category (e.g., "Holiday", "Sports", "Demographics")
      - `tags` (text[]) - Array of tag indicators (e.g., ["Holiday", "Sports", "High Value"])
      - `is_featured` (boolean) - Whether audience appears in featured section
      - `season` (text) - Optional seasonal indicator (e.g., "Q4", "Holiday")
      - `sports_league` (text) - Optional sports league association (e.g., "NHL", "NFL")
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `audiences` table
    - Add policy for public read access (external-facing tool)

  3. Notes
    - This is an external-facing media kit tool
    - Read-only access for public users
    - Future: API integration with Audience Builder tool
*/

CREATE TABLE IF NOT EXISTS audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  season text,
  sports_league text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audiences"
  ON audiences
  FOR SELECT
  TO anon
  USING (true);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_audiences_category ON audiences(category);
CREATE INDEX IF NOT EXISTS idx_audiences_is_featured ON audiences(is_featured);
CREATE INDEX IF NOT EXISTS idx_audiences_name ON audiences USING gin(to_tsvector('english', name));