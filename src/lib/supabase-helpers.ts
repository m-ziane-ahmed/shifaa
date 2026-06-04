/**
 * Supabase retourne les relations comme un tableau OU un objet selon le contexte.
 * Cette fonction normalise les deux cas en retournant toujours T | null.
 */
export function extractRelation<T>(raw: unknown): T | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return (raw[0] as T) ?? null;
  return raw as T;
}
