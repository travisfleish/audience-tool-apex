import type { AppVariant } from '../../appVariant';

export type BrandLogo = {
  src: string;
  alt: string;
  className?: string;
};

export type HeaderBranding = {
  primaryLogo: BrandLogo;
  /** Height of the vertical rule next to the co-brand logo; should match co-brand logo height. */
  coBrandDividerClassName?: string;
  coBrandLogo?: BrandLogo;
};

export type AppCopy = {
  heroTitle: string;
  /** Optional second line for multi-line hero H1 (e.g. NFL variant). */
  heroTitleLine2?: string;
  heroSubtitle?: string;
  heroSubtitle2?: string;

  // Optional extended landing copy for agency variants
  heroBody?: string;
  momentsTitle?: string;
  momentsSubtitle?: string;
  planningTitle?: string;
  planningSubtitle?: string;
  explorerTitle?: string;
  explorerSubtitle?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButton?: string;
  /** Placeholder for the custom audience description field in RequestCustomAudienceModal. */
  customAudienceDescriptionPlaceholder?: string;
};

export type PromoBulletGroup = {
  title: string;
  bullets: string[];
};

export type PromoSlideConfig = {
  title: string;
  body?: string;
  bullets?: string[];
  bulletGroups?: PromoBulletGroup[];
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  /** Tailwind classes applied to the slide image (e.g. crop/zoom via scale + object-position). */
  imageClassName?: string;
  /** md+ grid template for media/text split. Defaults to `3fr 2fr`. */
  mediaGridClassName?: string;
  /** Aspect ratio classes for the media container (e.g. `aspect-video`). */
  mediaAspectClassName?: string;
  /** When false, media keeps its aspect ratio instead of stretching to card height on md+. */
  mediaFillHeight?: boolean;
  /** Extra classes for the media container (e.g. background color matching the image). */
  mediaContainerClassName?: string;
  /** Optional logo rendered below slide copy to balance vertical space. */
  footerLogo?: BrandLogo;
  /** Centers slide copy and footer logo within the text column. */
  contentAlign?: 'left' | 'center';
};

export type PromoModuleConfig = {
  id: string;
  anchorId: string;
  title: string;
  subtitle?: string;
  slides: PromoSlideConfig[];
  decorImageSrc?: string;
};

export type AppConfig = {
  variant: AppVariant;
  appName: string;

  header: HeaderBranding;
  homepageSections: string[];
  enableGating: boolean;

  notebookStorageKey: string;
  allAudiencesCsvFilename: string;

  analyticsKey?: string;
  copy: AppCopy;

  /** When set, sport selection is locked to this slug (e.g. nfl). */
  lockedSportSlug?: string;
  /** Restricts available sport filters; defaults to all sports when omitted. */
  allowedSportSlugs?: string[];
  /** When false, FeaturedReport / planning guide is hidden. Defaults to true. */
  showPlanningGuide?: boolean;
  /** Promo carousel modules rendered below Moments. */
  promoModules?: PromoModuleConfig[];

  /** SSP options for deal-request SSP Preference dropdown (Index Exchange variant). */
  sspPreferenceOptions?: readonly string[];
};

