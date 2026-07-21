import type { AppConfig } from '../../core/config/appConfig';

export const nflConfig: AppConfig = {
  variant: 'nfl',
  appName: 'Genius Sports NFL Media Explorer',
  header: {
    primaryLogo: {
      src: '/logos/genius-white.svg',
      alt: 'Genius Sports',
    },
  },
  homepageSections: ['hero', 'moments', 'alt-cast', 'international-inventory', 'audience-explorer'],
  enableGating: true,
  analyticsKey: undefined,
  notebookStorageKey: 'nfl_notebook',
  allAudiencesCsvFilename: 'nfl-all-audiences.csv',
  lockedSportSlug: 'nfl',
  allowedSportSlugs: ['nfl'],
  showPlanningGuide: false,
  copy: {
    heroTitle: 'Genius Sports',
    heroTitleLine2: 'NFL Media Explorer',
    heroSubtitle:
      'Search NFL audience segments and build customized Moment Deal IDs. Explore audiences and choose moments to get started.',
    heroSubtitle2: undefined,
    heroBody: undefined,
    momentsTitle: 'Key NFL Moments',
    momentsSubtitle: 'Plan campaigns around the NFL moments that move audiences.',
    explorerTitle: 'Explore NFL Audiences',
    explorerSubtitle: 'Search the full library of NFL audience segments available for activation.',
    ctaTitle: 'Ready to activate?',
    ctaSubtitle: 'Talk to your Genius Sports rep or request access to the full NFL audience library.',
    ctaButton: 'Request Access',
    customAudienceDescriptionPlaceholder:
      'e.g. Fans of NFL teams who also purchase athletic footwear',
  },
  promoModules: [
    {
      id: 'alt-cast',
      anchorId: 'alt-cast',
      title: 'NFL Alt-Cast',
      subtitle: 'An Emmy award-winning alternative broadcast experience for NFL fans.',
      decorImageSrc: '/nfl/green-lines.png',
      slides: [
        {
          title: 'Beyond the Traditional\u00A0Broadcast',
          body: 'Genius creates a complete digital twin of the game, enabling the entire broadcast to be rebuilt, restyled and reimagined. Stat View Custom powers original, entertainment grade productions like Maddencast.',
          contentAlign: 'center',
          footerLogo: {
            src: '/genius_logo.svg',
            alt: 'Genius Sports',
            className: 'h-20 sm:h-24 md:h-28 w-auto',
          },
          videoSrc: '/nfl/maddencast.webm',
          imageAlt: 'Madden NFL Alt-Cast broadcast',
        },
        {
          title: 'Unlimited Customization for Brand Partners',
          bullets: [
            'Enables unlimited customization to build a fully original viewing experience',
            'Transforms the game into a new entertainment asset that brands can own, extend and monetize',
            'Delivers a premium content property that stands miles apart from standard broadcast or second screen experiences',
          ],
          imageSrc: '/nfl/maddencast-frame-6s.png',
          imageAlt: 'Madden NFL Alt-Cast broadcast with brand integration',
          mediaAspectClassName: 'aspect-video',
          mediaContainerClassName: 'bg-black',
          imageClassName: 'object-contain',
        },
      ],
    },
    {
      id: 'international-inventory',
      anchorId: 'international-inventory',
      title: "NFL's Global Fanbase. Exclusive Access.",
      subtitle:
        "Genius Sports is the best way to reach 106M+ NFL fans across the league's official international digital properties in the markets that matter most.",
      slides: [
        {
          title: 'Genius is the Exclusive Seller of NFL International Inventory',
          body: "The NFL is the world's most valuable sports property — and it's going global. With games now played in the UK, Germany, Brazil, Spain, Ireland, Paris, and Australia, international fandom is growing faster than ever. Genius Sports holds the exclusive rights to sell NFL international digital media inventory, giving brands direct access to 106M+ passionate NFL fans across the league's fastest-growing markets.",
          bullets: [
            '**240M+** NFL fans worldwide, with **106M+** reachable across key international markets',
            '**62.5M** international Super Bowl viewers — up **10%** year over year',
            'Exclusive NFL partnership: the only way to buy international digital inventory',
          ],
          imageSrc: '/nfl/nfl_fan.png',
          mediaGridClassName: 'md:grid-cols-[5fr_3fr]',
          mediaAspectClassName: 'aspect-video',
          imageAlt: 'NFL fan celebrating at a stadium',
        },
        {
          title: 'What We Sell',
          bulletGroups: [
            {
              title: 'Properties',
              bullets: [
                'NFL.com (International IP/users)',
                'NFL.com/country',
                'NextGenStats.NFL.com',
                'NFL mobile app',
              ],
            },
            {
              title: 'Standard Formats',
              bullets: [
                'Desktop & App: 728×90, 300×250, 320×50',
                'Video Format: 640×360',
              ],
            },
            {
              title: 'Premium Formats',
              bullets: ['Desktop: 160×600, 300×600'],
            },
            {
              title: 'Packages',
              bullets: ['Season long, tentpole and campaign package'],
            },
          ],
          imageSrc: '/nfl/nflfn-cropped.png',
          mediaContainerClassName: 'bg-[#111729]',
          imageClassName: 'object-contain',
          imageAlt: 'NFL App on mobile devices',
        },
      ],
    },
  ],
};
