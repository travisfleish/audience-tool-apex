import type { AppConfig } from '../../core/config/appConfig';

export const guideConfig: AppConfig = {
  variant: 'guide',
  appName: 'Genius Sports Audience Explorer',
  header: {
    primaryLogo: {
      src: '/logos/genius-white.svg',
      alt: 'Genius Sports',
    },
  },
  homepageSections: ['hero', 'search', 'featured-audiences', 'moments', 'popular-audiences'],
  enableGating: true,
  analyticsKey: undefined,
  notebookStorageKey: 'guide_notebook',
  allAudiencesCsvFilename: 'guide-all-audiences.csv',
  copy: {
    heroTitle: 'Genius Sports Advertising',
    heroSubtitle:
      'Search audience segments and build customized Moment Deal IDs. Select a sport, explore audiences, and choose moments to get started.',
    heroSubtitle2: undefined,
  },
};
