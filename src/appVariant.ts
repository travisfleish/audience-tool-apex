export type AppVariant = 'main' | 'pmg' | 'guide' | 'wpp' | 'index-exchange' | 'equativ' | 'nfl';

export const APP_VARIANT: AppVariant =
  (import.meta.env.VITE_APP_VARIANT as AppVariant) ?? 'main';
