/*
  # Enable HTTP Extension

  1. Extension
    - Enables the pg_net extension for making HTTP requests from SQL
    - Required for calling external APIs (OpenAI) from database functions
*/

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
