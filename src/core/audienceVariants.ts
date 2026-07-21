import type { Audience } from './types';

export const AUDIENCE_SELECT =
  'id, name, display_name, description, category, tags, is_featured, sports_league, created_at, updated_at';

function isAudienceRow(row: unknown): row is Audience {
  return typeof row === 'object' && row !== null && 'id' in row && 'name' in row;
}

export function toAudiences(data: unknown[] | null): Audience[] {
  if (!data) return [];
  return data.filter(isAudienceRow);
}
