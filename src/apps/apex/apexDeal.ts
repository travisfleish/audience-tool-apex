import type { MomentActivationTarget } from '../../core/moments/types';
import type { ApexSubVertical, ApexVertical } from './verticalsCatalog';
import type { ApexSport } from './sportsCatalog';

export type ApexDeal = {
  sport: ApexSport | null;
  vertical: ApexVertical | null;
  subVerticals: ApexSubVertical[];
  moments: MomentActivationTarget[];
};

export const EMPTY_APEX_DEAL: ApexDeal = {
  sport: null,
  vertical: null,
  subVerticals: [],
  moments: [],
};

export function apexDealItemCount(deal: ApexDeal): number {
  return (
    (deal.sport ? 1 : 0) +
    (deal.vertical ? 1 : 0) +
    deal.subVerticals.length +
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
      moments: Array.isArray(parsed.moments) ? parsed.moments : [],
    };
  } catch {
    return EMPTY_APEX_DEAL;
  }
}

export function formatApexMomentLabel(moment: MomentActivationTarget): string {
  const parts = [moment.name];
  if (moment.packageName && moment.packageName !== moment.name) {
    parts.push(moment.packageName);
  }
  if (moment.sportLabel) parts.push(moment.sportLabel);
  return parts.join(' · ');
}
