import type { AppConfig } from '../../core/config/appConfig';

export const mainConfig: AppConfig = {
  variant: 'main',
  appName: 'Genius Sports Audience Explorer',
  header: {
    primaryLogo: {
      src: '/logos/genius-white.svg',
      alt: 'Genius Sports',
    },
  },
  homepageSections: ['hero', 'search', 'featured-audiences', 'moments', 'featured-report', 'popular-audiences'],
  enableGating: true,
  analyticsKey: undefined,
  notebookStorageKey: 'notebook',
  allAudiencesCsvFilename: 'genius-sports-all-audiences.csv',
  copy: {
    heroTitle: 'Genius Sports Advertising',
    heroSubtitle:
      'Search audience segments and build customized Moment Deal IDs. Select a sport, explore audiences, and choose moments to get started.',
    heroSubtitle2: undefined,
  },
};
