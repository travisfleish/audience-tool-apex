/*
  # Drop unused indexes

  Removes 13 indexes that have never been used, reducing storage overhead
  and write amplification.

  1. Dropped Indexes
    - `idx_gate_visits_client_id` on `gate_visits`
    - `idx_gate_visits_user_name` on `gate_visits`
    - `idx_gate_visits_created_at` on `gate_visits`
    - `idx_gate_logins_client_id` on `gate_logins`
    - `idx_gate_logins_user_name` on `gate_logins`
    - `idx_gate_logins_created_at` on `gate_logins`
    - `idx_search_logs_created_at` on `search_logs`
    - `idx_search_logs_user_name` on `search_logs`
    - `idx_audiences_search_vector` on `audiences`
    - `idx_report_downloads_source` on `report_downloads`
    - `idx_report_downloads_email` on `report_downloads`
    - `idx_report_downloads_report_id` on `report_downloads`
    - `idx_report_downloads_downloaded_at` on `report_downloads`
*/

DROP INDEX IF EXISTS idx_gate_visits_client_id;
DROP INDEX IF EXISTS idx_gate_visits_user_name;
DROP INDEX IF EXISTS idx_gate_visits_created_at;
DROP INDEX IF EXISTS idx_gate_logins_client_id;
DROP INDEX IF EXISTS idx_gate_logins_user_name;
DROP INDEX IF EXISTS idx_gate_logins_created_at;
DROP INDEX IF EXISTS idx_search_logs_created_at;
DROP INDEX IF EXISTS idx_search_logs_user_name;
DROP INDEX IF EXISTS idx_audiences_search_vector;
DROP INDEX IF EXISTS idx_report_downloads_source;
DROP INDEX IF EXISTS idx_report_downloads_email;
DROP INDEX IF EXISTS idx_report_downloads_report_id;
DROP INDEX IF EXISTS idx_report_downloads_downloaded_at;
