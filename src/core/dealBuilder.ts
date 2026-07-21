import type { Audience } from './types';
import type { MomentActivationTarget } from './moments/types';

export type Deal = {
  audience: Audience | null;
  moment: MomentActivationTarget | null;
};

export const EMPTY_DEAL: Deal = {
  audience: null,
  moment: null,
};

const DEAL_BUILDER_INTRO_KEY = 'dealBuilderIntroSeen';

export function isDealEmpty(deal: Deal): boolean {
  return !deal.audience && !deal.moment;
}

export function dealItemCount(deal: Deal): number {
  return (deal.audience ? 1 : 0) + (deal.moment ? 1 : 0);
}

export function isDealComplete(deal: Deal): boolean {
  return !!deal.audience && !!deal.moment;
}

function formatMomentCategory(category: string): string {
  if (!category) return category;
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function formatMomentLabel(moment: MomentActivationTarget): string {
  const parts = [moment.name];
  if (moment.sportLabel) parts.push(moment.sportLabel);
  if (moment.category) parts.push(formatMomentCategory(moment.category));
  return parts.join(' · ');
}

export function parseStoredDeal(saved: string): Deal {
  try {
    const parsed = JSON.parse(saved) as unknown;
    if (Array.isArray(parsed)) {
      return {
        audience: (parsed[0] as Audience | undefined) ?? null,
        moment: null,
      };
    }
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Partial<Deal>;
      return {
        audience: record.audience ?? null,
        moment: record.moment ?? null,
      };
    }
  } catch {
    // Fall through to empty deal.
  }
  return EMPTY_DEAL;
}

export function hasSeenDealBuilderIntro(): boolean {
  try {
    return localStorage.getItem(DEAL_BUILDER_INTRO_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markDealBuilderIntroSeen(): void {
  try {
    localStorage.setItem(DEAL_BUILDER_INTRO_KEY, 'true');
  } catch {
    // Ignore storage errors.
  }
}

export function scrollToMomentsSection(): void {
  document.getElementById('moments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function scrollToAudiencesSection(): void {
  document.getElementById('audiences')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
