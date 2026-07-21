import type { AppConfig } from '../../core/config/appConfig';

export const indexExchangeConfig: AppConfig = {
  variant: 'index-exchange',
  appName: 'Index Exchange Audience Intelligence',
  header: {
    primaryLogo: {
      src: '/logos/genius-white.svg',
      alt: 'Genius Sports',
    },
    coBrandLogo: {
      src: '/logos/index_exchange_white.png',
      alt: 'Index Exchange',
      className: 'h-7 sm:h-8 md:h-9 w-auto object-contain',
    },
  },
  homepageSections: ['hero', 'moments', 'planning-guide', 'audience-explorer', 'cta'],
  enableGating: true,
  sspPreferenceOptions: [
    'Index Exchange',
    'Magnite',
    'PubMatic',
    'OpenX',
    'Sharethrough',
    'No Preference',
  ],
  analyticsKey: undefined,
  notebookStorageKey: 'index_exchange_notebook',
  allAudiencesCsvFilename: 'index-exchange-all-audiences.csv',
  copy: {
    heroTitle: 'Genius Sports Advertising',
    heroSubtitle:
      'Search audience segments and build customized Moment Deal IDs. Select a sport, explore audiences, and choose moments to get started.',
    heroSubtitle2: undefined,
    heroBody: undefined,
    momentsTitle: 'Key Sports Moments',
    momentsSubtitle: 'Plan campaigns around the moments that move audiences.',
    planningTitle: 'Planning Guide',
    planningSubtitle:
      'Download the 2026 Genius Sports Media Guide for full audience data, reach estimates, and activation guidance.',
    explorerTitle: 'Explore Audiences',
    explorerSubtitle: 'Search the full library of sports audience segments available for activation.',
    ctaTitle: 'Ready to activate?',
    ctaSubtitle: 'Talk to your Genius Sports rep or request access to the full audience library.',
    ctaButton: 'Request Access',
  },
};
