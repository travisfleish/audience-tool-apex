import type { ReactNode } from 'react';
import GeniusStripHoverBg from './GeniusStripHoverBg';

const KLARHEIT_STACK =
  "font-['ESKlarheitKurrentTRIAL','ES_Klarheit_Kurrent',system-ui,-apple-system,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji']";

/**
 * Marketing CTA label: `ESKlarheitKurrentTRIAL` Book @ 17px / 20.4px lh / -0.180625px tracking (matches live hero CTA computed style).
 * Add `text-white` or `text-[rgb(13,18,38)]` (etc.) for color.
 */
export const HERO_CTA_KLARHEIT_TYPO_CLASS = `${KLARHEIT_STACK} text-[17px] font-normal leading-[20.4px] tracking-[-0.180625px] [font-feature-settings:normal] [font-variation-settings:normal] antialiased`;

/** Audience card action row — same Klarheit face at 14px so labels fit beside each other. */
export const AUDIENCE_CARD_CTA_KLARHEIT_CLASS = `${KLARHEIT_STACK} text-[14px] font-normal leading-[18px] tracking-[-0.14px] [font-feature-settings:normal] [font-variation-settings:normal] antialiased`;

/**
 * Shared header nav label typography (16px / 400 / 24px line-height).
 * Primary face: `ESKlarheitKurrentTRIAL` @font-face → Bk/Md/Smbd .woff2 in /public/fonts; falls back to `ES Klarheit Kurrent` (same files).
 */
export const HEADER_NAV_FONT_CLASS = `${KLARHEIT_STACK} text-[16px] font-normal leading-[24px] text-[rgb(13,18,38)] [font-feature-settings:normal] [font-variation-settings:normal] [font-kerning:auto] [font-optical-sizing:auto] [font-size-adjust:none] [font-stretch:100%]`;

/** Tighter header nav labels when co-brand logos and logout share the bar. */
export const HEADER_NAV_COMPACT_FONT_CLASS = `${KLARHEIT_STACK} text-[14px] font-normal leading-[20px] text-[rgb(13,18,38)] [font-feature-settings:normal] [font-variation-settings:normal] [font-kerning:auto] [font-optical-sizing:auto] [font-size-adjust:none] [font-stretch:100%]`;

/** Header nav pill CTA — compact on small viewports; matches marketing metrics at `lg+`. */
const HEADER_NAV_CTA_PILL_LABEL_CLASS = `${HEADER_NAV_FONT_CLASS} relative z-20 block whitespace-nowrap rounded-full px-3 py-2 text-center transition-colors duration-300 ease-in-out group-hover:text-white sm:px-4 sm:py-2.5 md:px-5 md:py-3 lg:px-5 lg:py-[0.8rem]`;

const HEADER_NAV_COMPACT_CTA_PILL_LABEL_CLASS = `${HEADER_NAV_COMPACT_FONT_CLASS} relative z-20 block whitespace-nowrap rounded-full px-2 py-1.5 text-center transition-colors duration-300 ease-in-out group-hover:text-white sm:px-3 sm:py-2 lg:px-4 lg:py-2`;

export const HEADER_NAV_LABEL_CLASS = `cursor-pointer items-center whitespace-nowrap shrink-0 ${HEADER_NAV_FONT_CLASS} box-border`;

export const HEADER_NAV_COMPACT_LABEL_CLASS = `cursor-pointer items-center whitespace-nowrap shrink-0 ${HEADER_NAV_COMPACT_FONT_CLASS} box-border`;

/** Apply to the interactive element wrapping {@link HeroCtaPillSurface} (matches world-cup-v2 hero CTA focus ring). */
export const HERO_CTA_FOCUS_CLASS =
  'group inline-flex max-w-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1226] focus-visible:ring-offset-2';

/** Focus ring + max width for header pills (matches marketing “Visit Genius Sports” control). */
export const HERO_CTA_HEADER_LINK_CLASS =
  'group inline-flex max-w-[20.9375rem] items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1226] focus-visible:ring-offset-2';

/** Dark marketing CTAs — matches live hero / “Request a demo” pill rhythm (px / py). */
export const HERO_CTA_MARKETING_PILL_PADDING_CLASS =
  'px-[36px] sm:px-12 py-[15px] md:py-[17px]';

type HeroCtaPillSurfaceProps = {
  children: ReactNode;
  /** Fill parent width (Learn More, wide CTAs). */
  fullWidth?: boolean;
  /**
   * `light` — `gs` muted grey fill, smaller type, navy → white label on hover (marketing header style).
   * `dark` — solid navy pill with white label (hero / in-page CTAs).
   */
  variant?: 'dark' | 'light';
  /** Use fixed header nav typography ({@link HEADER_NAV_FONT_CLASS}) instead of responsive marketing sizes. */
  headerNav?: boolean;
  /** Tighter padding and 14px type for crowded co-brand headers. */
  headerNavCompact?: boolean;
  /** Light pill on dark header / hero (grey fill instead of translucent navy). */
  onDarkBackground?: boolean;
  /** Tighter pill on small viewports (hero search submit). */
  compact?: boolean;
  /**
   * `light` only: same padding + Klarheit metrics as dark pills (e.g. Preview beside Download).
   */
  lightPairedWithDark?: boolean;
};

/**
 * Pill surface + Genius strip hover animation — dark variant matches world-cup-v2 “Get Started”;
 * light variant matches marketing header secondary CTAs while keeping the same strip animation.
 */
export function HeroCtaPillSurface({
  children,
  fullWidth,
  variant = 'dark',
  headerNav,
  headerNavCompact,
  lightPairedWithDark,
  onDarkBackground,
  compact,
}: HeroCtaPillSurfaceProps) {
  if (variant === 'light') {
    const lightSurfaceClass = onDarkBackground
      ? 'hero-control-surface bg-[#eef1f6]'
      : headerNav
        ? 'bg-[#0d1226]/5'
        : 'bg-gs-bg-muted';
    const compactDarkBgLabelClass = `${HERO_CTA_KLARHEIT_TYPO_CLASS} text-[#0c1220] relative z-20 block whitespace-nowrap rounded-[125rem] text-center transition-colors duration-300 ease-in-out group-hover:text-white px-5 py-2 text-[15px] leading-[18px] sm:px-[36px] sm:py-[15px] sm:text-[17px] sm:leading-[20.4px] md:py-[17px]`;
    const darkBgLabelClass = `${HERO_CTA_KLARHEIT_TYPO_CLASS} text-[#0c1220] relative z-20 block whitespace-nowrap rounded-[125rem] text-center transition-colors duration-300 ease-in-out group-hover:text-white ${HERO_CTA_MARKETING_PILL_PADDING_CLASS}`;
    // Inner label matches marketing header CTAs (e.g. “Visit Genius Sports”) pixel-for-pixel, or fixed nav type when headerNav.
    const headerNavDarkLabelClass = headerNavCompact
      ? `${HEADER_NAV_COMPACT_FONT_CLASS} relative z-20 block whitespace-nowrap rounded-full px-2 py-1.5 text-center text-[#0c1220] transition-colors duration-300 ease-in-out group-hover:text-white sm:px-3 sm:py-2 lg:px-4 lg:py-2`
      : `${HEADER_NAV_FONT_CLASS} relative z-20 block whitespace-nowrap rounded-full px-3 py-2 text-center text-[#0c1220] transition-colors duration-300 ease-in-out group-hover:text-white sm:px-4 sm:py-2.5 md:px-5 md:py-3 lg:px-5 lg:py-[0.8rem]`;
    const lightLabelClass = headerNav
      ? onDarkBackground
        ? headerNavDarkLabelClass
        : headerNavCompact
          ? HEADER_NAV_COMPACT_CTA_PILL_LABEL_CLASS
          : HEADER_NAV_CTA_PILL_LABEL_CLASS
      : lightPairedWithDark
        ? `${HERO_CTA_KLARHEIT_TYPO_CLASS} text-[rgb(13,18,38)] relative z-20 block whitespace-nowrap rounded-[125rem] text-center transition-colors duration-300 ease-in-out group-hover:text-white ${HERO_CTA_MARKETING_PILL_PADDING_CLASS}`
        : onDarkBackground
          ? compact
            ? compactDarkBgLabelClass
            : darkBgLabelClass
          : `${HERO_CTA_KLARHEIT_TYPO_CLASS} text-[rgb(13,18,38)] relative z-20 block whitespace-nowrap rounded-[125rem] px-4 py-2.5 text-center transition-colors duration-300 ease-in-out group-hover:text-white sm:px-6 sm:py-3 md:px-8 md:py-3.5 lg:px-5 lg:py-[0.8rem]`;

    return (
      <span
        className={`relative inline-flex max-w-full cursor-pointer overflow-hidden rounded-[125rem] ${lightSurfaceClass} ${onDarkBackground ? 'hero-control border border-[rgba(255,255,255,0.2)]' : ''} ${fullWidth ? 'w-full' : ''}`}
      >
        <GeniusStripHoverBg />
        <span className={`${lightLabelClass} ${fullWidth ? 'w-full' : 'w-max min-w-0 max-w-full'}`}>
          {children}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`relative overflow-hidden rounded-[125rem] bg-[#0d1226] ${fullWidth ? 'block w-full' : ''}`}
    >
      <GeniusStripHoverBg />
      <span
        className={`relative left-0 z-20 inline-flex items-center justify-center rounded-[125rem] text-center text-white transition-colors duration-300 ease-in-out ${HERO_CTA_MARKETING_PILL_PADDING_CLASS} ${HERO_CTA_KLARHEIT_TYPO_CLASS} ${
          fullWidth ? 'w-full' : 'w-max max-w-full'
        }`}
      >
        {children}
      </span>
    </span>
  );
}
