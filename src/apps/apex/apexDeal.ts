import type { MomentActivationTarget } from '../../core/moments/types';
import type { ApexSubVertical, ApexVertical } from './verticalsCatalog';
import type { ApexSport } from './sportsCatalog';

export type ApexAudienceInsight = {
  id: string;
  text: string;
};

export type ApexDeal = {
  sport: ApexSport | null;
  vertical: ApexVertical | null;
  subVerticals: ApexSubVertical[];
  audienceInsights: ApexAudienceInsight[];
  moments: MomentActivationTarget[];
};

export const EMPTY_APEX_DEAL: ApexDeal = {
  sport: null,
  vertical: null,
  subVerticals: [],
  audienceInsights: [],
  moments: [],
};

export function apexDealItemCount(deal: ApexDeal): number {
  return (
    (deal.sport ? 1 : 0) +
    (deal.vertical ? 1 : 0) +
    deal.subVerticals.length +
    deal.audienceInsights.length +
    deal.moments.length
  );
}

export function isApexDealEmpty(deal: ApexDeal): boolean {
  return apexDealItemCount(deal) === 0;
}

/** Sport + at least one sub-vertical + at least one moment. */
export function isApexDealComplete(deal: ApexDeal): boolean {
  return Boolean(deal.sport && deal.vertical && deal.subVerticals.length > 0 && deal.moments.length > 0);
}

export function parseStoredApexDeal(saved: string): ApexDeal {
  try {
    const parsed = JSON.parse(saved) as Partial<ApexDeal>;
    if (!parsed || typeof parsed !== 'object') return EMPTY_APEX_DEAL;
    return {
      sport: parsed.sport ?? null,
      vertical: parsed.vertical ?? null,
      subVerticals: Array.isArray(parsed.subVerticals) ? parsed.subVerticals : [],
      audienceInsights: Array.isArray(parsed.audienceInsights)
        ? parsed.audienceInsights.filter(
            (item): item is ApexAudienceInsight =>
              Boolean(item) &&
              typeof item === 'object' &&
              typeof (item as ApexAudienceInsight).id === 'string' &&
              typeof (item as ApexAudienceInsight).text === 'string',
          )
        : [],
      moments: Array.isArray(parsed.moments) ? parsed.moments : [],
    };
  } catch {
    return EMPTY_APEX_DEAL;
  }
}

const CUSTOM_INSIGHT_ID_PREFIX = 'insight:';

export function createApexAudienceInsight(text: string): ApexAudienceInsight {
  const trimmed = text.trim();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return {
    id: `${CUSTOM_INSIGHT_ID_PREFIX}${Date.now()}-${slug || 'insight'}`,
    text: trimmed,
  };
}

const CUSTOM_MOMENT_ID_PREFIX = 'custom:';

export function isCustomApexMoment(moment: MomentActivationTarget): boolean {
  return moment.id.startsWith(CUSTOM_MOMENT_ID_PREFIX);
}

export function createCustomApexMoment(
  name: string,
  sportLabel?: string,
): MomentActivationTarget {
  const trimmed = name.trim();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return {
    id: `${CUSTOM_MOMENT_ID_PREFIX}${Date.now()}-${slug || 'moment'}`,
    name: trimmed,
    category: 'context',
    sportLabel,
    packageName: 'Custom',
  };
}

export function formatApexMomentLabel(moment: MomentActivationTarget): string {
  const parts = [moment.name];
  if (moment.packageName && moment.packageName !== moment.name) {
    parts.push(moment.packageName);
  }
  if (moment.sportLabel) parts.push(moment.sportLabel);
  return parts.join(' · ');
}
