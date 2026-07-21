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

export function getPackageItemsForSport(
  pkg: ThemedMomentPackage,
  sportSlug: string,
): { id: string; name: string }[] {
  const sportItems = pkg.items.filter(item => item.sportSlug === sportSlug);
  const sportNames = new Set(sportItems.map(item => item.name));
  const allSportOnly = pkg.items.filter(
    item => item.sportSlug === 'all_sport' && !sportNames.has(item.name),
  );

  return [...allSportOnly, ...sportItems].map(({ id, name }) => ({ id, name }));
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
