import type { AppConfig } from '../../core/config/appConfig';

export const equativConfig: AppConfig = {
  variant: 'equativ',
  appName: 'Equativ Audience Intelligence',
  header: {
    primaryLogo: {
      src: '/logos/genius-white.svg',
      alt: 'Genius Sports',
    },
    coBrandDividerClassName: 'site-header-divider h-5 sm:h-6 md:h-7 w-px',
    coBrandLogo: {
      src: '/logos/equativ.svg',
      alt: 'Equativ',
      className:
        'h-5 sm:h-6 md:h-7 w-auto max-w-[5.5rem] sm:max-w-[6.25rem] md:max-w-[7rem] object-contain object-left',
    },
  },
  homepageSections: ['hero', 'moments', 'planning-guide', 'audience-explorer', 'cta'],
  enableGating: true,
  analyticsKey: undefined,
  notebookStorageKey: 'equativ_notebook',
  allAudiencesCsvFilename: 'equativ-all-audiences.csv',
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
