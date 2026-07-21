import catalogJson from './momentsCatalog.generated.json';
import type {
  MindsetMomentPackage,
  MomentSport,
  MomentsCatalog,
  ThemedMomentPackage,
} from './types';

export const momentsCatalog = catalogJson as MomentsCatalog;

export const MOMENT_SPORTS: MomentSport[] = momentsCatalog.sports;

export const MINDSET_PACKAGES: MindsetMomentPackage[] = momentsCatalog.mindsetPackages;

export const EMOTION_PACKAGES: ThemedMomentPackage[] = momentsCatalog.emotionPackages;

export const CONTEXT_PACKAGES: ThemedMomentPackage[] = momentsCatalog.contextPackages;

/**
 * Expand catalog rows into selectable discrete game signals.
 *
 * Catalog cells often look like `Highlight Score (Poster Dunk, Unassisted Goal, …)`.
 * Apex selections should be the parenthetical terms (plus bare higher-level labels
 * like "Momentum Shift"). This is a placeholder expansion until Product Marketing
 * ships the canonical discrete-signal list.
 */
function expandToDiscreteSignals(
  items: { id: string; name: string }[],
): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const match = item.name.match(/^(.+?)\s*\((.+)\)\s*$/);
    const signalNames = match
      ? match[2]
          .split(',')
          .map(part => part.trim())
          .filter(Boolean)
      : [item.name];

    for (const [index, signalName] of signalNames.entries()) {
      const key = signalName.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        id: match ? `${item.id}--signal-${index}` : item.id,
        name: signalName,
      });
    }
  }

  return result;
}

export function getPackageItemsForSport(
  pkg: ThemedMomentPackage,
  sportSlug: string,
): { id: string; name: string }[] {
  const sportItems = pkg.items.filter(item => item.sportSlug === sportSlug);
  const sportNames = new Set(sportItems.map(item => item.name));
  const allSportOnly = pkg.items.filter(
    item => item.sportSlug === 'all_sport' && !sportNames.has(item.name),
  );

  return expandToDiscreteSignals(
    [...allSportOnly, ...sportItems].map(({ id, name }) => ({ id, name })),
  );
}

export function getSportLabel(sportSlug: string): string {
  return MOMENT_SPORTS.find(sport => sport.slug === sportSlug)?.label ?? sportSlug;
}

export function getPackageDescriptionForSport(
  pkg: ThemedMomentPackage,
  sportSlug: string,
): string | undefined {
  return pkg.sportDescriptions?.[sportSlug] ?? pkg.description;
}
