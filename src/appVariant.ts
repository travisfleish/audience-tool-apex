export type AppVariant =
  | 'main'
  | 'pmg'
  | 'guide'
  | 'wpp'
  | 'index-exchange'
  | 'equativ'
  | 'nfl'
  | 'apex';

export const APP_VARIANT: AppVariant =
  (import.meta.env.VITE_APP_VARIANT as AppVariant) ?? 'apex';
