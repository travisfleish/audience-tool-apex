import type { AppConfig } from '../../core/config/appConfig';

export const pmgConfig: AppConfig = {
  variant: 'pmg',
  appName: 'PMG Audience Intelligence',
  header: {
    primaryLogo: {
      src: '/logos/genius-white.svg',
      alt: 'Genius Sports',
    },
    coBrandLogo: {
      src: '/pmg.png',
      alt: 'PMG',
      className: 'h-9 sm:h-10 md:h-12 w-auto object-contain',
    },
  },
  homepageSections: ['hero', 'moments', 'planning-guide', 'audience-explorer', 'cta'],
  enableGating: true,
  analyticsKey: undefined,
  notebookStorageKey: 'pmg_notebook',
  allAudiencesCsvFilename: 'pmg-all-audiences.csv',
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
