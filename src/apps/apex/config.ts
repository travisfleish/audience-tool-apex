import type { AppConfig } from '../../core/config/appConfig';

export const apexConfig: AppConfig = {
  variant: 'apex',
  appName: 'Custom Apex Moment Builder',
  header: {
    primaryLogo: {
      src: '/logos/genius-white.svg',
      alt: 'Genius Sports',
      className:
        'h-9 w-auto max-h-9 object-contain object-left brightness-0 sm:h-10 sm:max-h-10 md:h-11 md:max-h-11',
    },
    coBrandDividerClassName: 'h-9 sm:h-10 md:h-12 w-px bg-[var(--apex-line-strong)]',
    coBrandLogo: {
      src: '/logos/apex-exchange-light.png',
      alt: 'Apex Exchange',
      className: 'h-11 sm:h-12 md:h-14 w-auto object-contain',
    },
  },
  homepageSections: ['hero', 'sport', 'vertical', 'moments'],
  enableGating: true,
  analyticsKey: undefined,
  notebookStorageKey: 'apex_moment_builder',
  allAudiencesCsvFilename: 'apex-moment-builder.csv',
  allowedSportSlugs: ['nfl', 'nba', 'nhl', 'mlb', 'mls', 'wnba', 'nwsl', 'golf', 'tennis'],
  showPlanningGuide: false,
  copy: {
    heroTitle: 'Custom Apex Moment Builder',
    heroSubtitle:
      'Start by picking a sport, choose your vertical, and explore unique moments. Our team will build you a custom solution from what you submit.',
    heroSubtitle2: undefined,
    momentsTitle: 'Select your moments',
    momentsSubtitle:
      'Explore contextual signals across the season: pre-game, in-game, and post-game inspiration for your custom Apex recommendation.',
  },
};

export const APEX_ALLOWED_EMAIL_DOMAIN = 'apxexchange.com';

export const APEX_INVENTORY_CHANNELS = [
  'CTV',
  'OLV',
  'Display',
  'Audio',
  'Social',
  'Multi-channel',
  'Not sure yet',
] as const;
