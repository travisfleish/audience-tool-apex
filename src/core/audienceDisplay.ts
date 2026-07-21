import { Audience } from './types';

/** Short all-caps runs (e.g. NFL, NBA) stay uppercase; longer shouted words become Title case. */
const SHOUTED_ACRONYM_MAX_LEN = 3;

/** Longer league/org acronyms in all-caps source data (would otherwise become e.g. "Nwsl"). */
const PRESERVED_SHOUTED_ACRONYMS = new Set(['NWSL']);

/**
 * When a label is entirely uppercase (e.g. RESTAURANTS, DATING), convert long letter-runs to
 * Title case while keeping short runs as acronyms. Mixed-case or lowercase input is unchanged.
 */
export function normalizeShoutedDisplayName(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const letters = trimmed.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return text;
  if (letters !== letters.toUpperCase()) return text;

  return trimmed.replace(/[A-Z]+/g, (run) => {
    if (PRESERVED_SHOUTED_ACRONYMS.has(run)) return run;
    if (run.length <= SHOUTED_ACRONYM_MAX_LEN) return run;
    return run.charAt(0) + run.slice(1).toLowerCase();
  });
}

export function getDisplayName(audience: Audience, allAudiences: Audience[]): string {
  const parts = audience.name.split('>').map(part => part.trim());
  const lastName = parts[parts.length - 1];

  const duplicates = allAudiences.filter(a => {
    const otherParts = a.name.split('>').map(part => part.trim());
    const otherLastName = otherParts[otherParts.length - 1];
    return otherLastName === lastName;
  });

  if (duplicates.length > 1) {
    const parentContext = parts.length >= 2 ? parts[parts.length - 2] : 'Root';
    return `${normalizeShoutedDisplayName(lastName)} - ${normalizeShoutedDisplayName(parentContext)}`;
  }

  return normalizeShoutedDisplayName(lastName);
}

/**
 * Canonical category string for filters: merges duplicate DB casings (e.g. RESTAURANTS vs Restaurants)
 * and applies {@link normalizeShoutedDisplayName} when the value is all-caps.
 */
export function normalizeCategoryLabel(category: string): string {
  return normalizeShoutedDisplayName(category.trim());
}
