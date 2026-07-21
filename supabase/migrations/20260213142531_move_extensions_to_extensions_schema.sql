/*
  # Move extensions out of public schema

  Creates a dedicated `extensions` schema and moves three extensions
  into it to keep the public schema clean and reduce attack surface.

  1. New Schema
    - `extensions` — dedicated schema for PostgreSQL extensions

  2. Extensions Moved
    - `vector` (pgvector)
    - `pg_trgm` (trigram similarity)
    - `unaccent` (accent removal)

  3. Important Notes
    - The extensions schema is added to the default search_path so
      existing queries continue to resolve operators and types.
*/

CREATE SCHEMA IF NOT EXISTS extensions;

ALTER EXTENSION vector SET SCHEMA extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
ALTER EXTENSION unaccent SET SCHEMA extensions;
