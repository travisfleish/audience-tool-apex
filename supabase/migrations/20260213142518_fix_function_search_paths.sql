/*
  # Fix mutable search_path on public functions

  Sets an immutable search_path on all public functions to prevent
  search_path injection attacks. Each function is pinned to
  'public, extensions' so they can find both table objects and
  extension-provided operators/types.

  1. Functions Updated (15 total)
    - audiences_search_vector_trigger()
    - generate_all_embeddings()
    - generate_all_embeddings_v2()
    - hierarchical_semantic_search(vector, float8, int)
    - hybrid_semantic_search(text, vector, int, float8)  [4-param overload]
    - hybrid_semantic_search(text, text, vector, int, float8)  [5-param overload]
    - reverse_hierarchy(text)
    - search_audiences_brute_force(vector, float8, int)
    - search_audiences_by_embedding(vector, float8, int)
    - search_audiences_by_embedding_v2(vector, float8, int)
    - search_audiences_by_title(vector, float8, int)
    - search_audiences_hybrid(vector, text, text[], int, numeric)
    - semantic_search(text, int, float8)
    - semantic_search_v2(text, int, float8)
    - update_audience_embedding(uuid, json)
*/

ALTER FUNCTION public.audiences_search_vector_trigger()
  SET search_path = public;

ALTER FUNCTION public.generate_all_embeddings()
  SET search_path = public;

ALTER FUNCTION public.generate_all_embeddings_v2()
  SET search_path = public;

ALTER FUNCTION public.hierarchical_semantic_search(vector, double precision, integer)
  SET search_path = public;

ALTER FUNCTION public.hybrid_semantic_search(text, vector, integer, double precision)
  SET search_path = public;

ALTER FUNCTION public.hybrid_semantic_search(text, text, vector, integer, double precision)
  SET search_path = public;

ALTER FUNCTION public.reverse_hierarchy(text)
  SET search_path = public;

ALTER FUNCTION public.search_audiences_brute_force(vector, double precision, integer)
  SET search_path = public;

ALTER FUNCTION public.search_audiences_by_embedding(vector, double precision, integer)
  SET search_path = public;

ALTER FUNCTION public.search_audiences_by_embedding_v2(vector, double precision, integer)
  SET search_path = public;

ALTER FUNCTION public.search_audiences_by_title(vector, double precision, integer)
  SET search_path = public;

ALTER FUNCTION public.search_audiences_hybrid(vector, text, text[], integer, numeric)
  SET search_path = public;

ALTER FUNCTION public.semantic_search(text, integer, double precision)
  SET search_path = public;

ALTER FUNCTION public.semantic_search_v2(text, integer, double precision)
  SET search_path = public;

ALTER FUNCTION public.update_audience_embedding(uuid, json)
  SET search_path = public;
