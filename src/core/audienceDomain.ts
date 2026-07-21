import type { Audience } from './types';

/** Taxonomy root for retail / innovation lab segments */
const RETAIL_INNOVATION_LAB_PREFIX = 'Retail Innovation Lab';

/** Taxonomy root for sports segments */
const GENIUS_SPORTS_PREFIX = 'Genius Sports';

export type AudienceDomain = 'sports' | 'retail';

/** `null` means the user has not chosen Retail vs Sports yet (no domain filter). */
export type AudienceDomainSelection = AudienceDomain | null;

export function isRetailInnovationLabAudience(audience: Audience): boolean {
  return (audience.name ?? '').startsWith(RETAIL_INNOVATION_LAB_PREFIX);
}

export function isGeniusSportsAudience(audience: Audience): boolean {
  return (audience.name ?? '').startsWith(GENIUS_SPORTS_PREFIX);
}

export function audienceMatchesDomain(audience: Audience, domain: AudienceDomainSelection): boolean {
  if (domain === null) {
    return true;
  }
  if (domain === 'retail') {
    return isRetailInnovationLabAudience(audience);
  }
  return isGeniusSportsAudience(audience);
}
