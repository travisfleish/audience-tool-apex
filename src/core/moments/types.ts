export type MomentCategory = 'mindset' | 'emotion' | 'context';

export type MomentSport = {
  slug: string;
  label: string;
};

export type MomentPackageItem = {
  id: string;
  name: string;
  sportSlug: string;
};

export type MindsetMomentPackage = {
  id: string;
  slug: string;
  category: 'mindset';
  name: string;
  description: string;
};

export type ThemedMomentPackage = {
  id: string;
  slug: string;
  category: 'emotion' | 'context';
  name: string;
  subtitle: string;
  description?: string;
  sportDescriptions?: Partial<Record<string, string>>;
  items: MomentPackageItem[];
};

export type MomentPackage = MindsetMomentPackage | ThemedMomentPackage;

export type MomentActivationTarget = {
  id: string;
  name: string;
  category: MomentCategory;
  sportLabel?: string;
  packageName?: string;
};

export type MomentsCatalog = {
  sports: MomentSport[];
  mindsetPackages: MindsetMomentPackage[];
  emotionPackages: ThemedMomentPackage[];
  contextPackages: ThemedMomentPackage[];
};
