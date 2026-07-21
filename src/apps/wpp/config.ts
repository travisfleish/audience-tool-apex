import type { AppConfig } from '../../core/config/appConfig';

export const wppConfig: AppConfig = {
  variant: 'wpp',
  appName: 'WPP Audience Explorer',
  header: {
    primaryLogo: {
      src: '/logos/genius-white.svg',
      alt: 'Genius Sports',
    },
    coBrandDividerClassName: 'h-6 sm:h-7 md:h-8 w-px bg-gray-300',
    coBrandLogo: {
      src: '/logos/wpp.png',
      alt: 'WPP',
      className: 'h-6 sm:h-7 md:h-8 w-auto object-contain',
    },
  },
  homepageSections: ['hero', 'search', 'featured-audiences', 'moments', 'popular-audiences'],
  enableGating: true,
  analyticsKey: undefined,
  notebookStorageKey: 'wpp_notebook',
  allAudiencesCsvFilename: 'wpp-all-audiences.csv',
  copy: {
    heroTitle: 'WPP Audience Explorer',
    heroSubtitle:
      'Search audience segments and build customized Moment Deal IDs. Select a sport, explore audiences, and choose moments to get started.',
    heroSubtitle2: undefined,
  },
};
