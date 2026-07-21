/*
  # Fix search_path syntax on all public functions

  The previous migration set search_path = 'public, extensions' which
  PostgreSQL interprets as a single schema named literally "public, extensions".
  This broke all function resolution of tables and extension operators.

  The correct syntax uses unquoted, comma-separated identifiers:
    SET search_path = public, extensions

  1. Functions Updated (15 total)
    - All public functions now correctly resolve both the public schema
      (for tables) and the extensions schema (for vector, pg_trgm, unaccent)
*/

ALTER FUNCTION public.audiences_search_vector_trigger()
  SET search_path = public, extensions;

ALTER FUNCTION public.generate_all_embeddings()
  SET search_path = public, extensions;

ALTER FUNCTION public.generate_all_embeddings_v2()
  SET search_path = public, extensions;

ALTER FUNCTION public.hierarchical_semantic_search(extensions.vector, double precision, integer)
  SET search_path = public, extensions;

ALTER FUNCTION public.hybrid_semantic_search(text, extensions.vector, integer, double precision)
  SET search_path = public, extensions;

ALTER FUNCTION public.hybrid_semantic_search(text, text, extensions.vector, integer, double precision)
  SET search_path = public, extensions;

ALTER FUNCTION public.reverse_hierarchy(text)
  SET search_path = public, extensions;

ALTER FUNCTION public.search_audiences_brute_force(extensions.vector, double precision, integer)
  SET search_path = public, extensions;

ALTER FUNCTION public.search_audiences_by_embedding(extensions.vector, double precision, integer)
  SET search_path = public, extensions;

ALTER FUNCTION public.search_audiences_by_embedding_v2(extensions.vector, double precision, integer)
  SET search_path = public, extensions;

ALTER FUNCTION public.search_audiences_by_title(extensions.vector, double precision, integer)
  SET search_path = public, extensions;

ALTER FUNCTION public.search_audiences_hybrid(extensions.vector, text, text[], integer, numeric)
  SET search_path = public, extensions;

ALTER FUNCTION public.semantic_search(text, integer, double precision)
  SET search_path = public, extensions;

ALTER FUNCTION public.semantic_search_v2(text, integer, double precision)
  SET search_path = public, extensions;

ALTER FUNCTION public.update_audience_embedding(uuid, json)
  SET search_path = public, extensions;
