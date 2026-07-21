import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { HeaderBranding } from '../core/config/appConfig';
import { NOTEBOOK_ENABLED } from '../core/featureFlags';
import {
  HERO_CTA_FOCUS_CLASS,
  HERO_CTA_HEADER_LINK_CLASS,
  HeroCtaPillSurface,
} from './ui/HeroCtaPill';

interface HeaderProps {
  branding: HeaderBranding;
  notebookCount?: number;
  showNotebookLink?: boolean;
  notebookSidebarOpen?: boolean;
}

export function Header({
  branding,
  notebookCount = 0,
  showNotebookLink = NOTEBOOK_ENABLED,
  notebookSidebarOpen = false,
}: HeaderProps) {
  const location = useLocation();
  const [headerOpacity, setHeaderOpacity] = useState(1);

  useEffect(() => {
    let isTicking = false;
    const fadeDistance = 180;
    const isMobileViewport = window.matchMedia('(max-width: 639px)').matches;
    const minimumMobileOpacity = 0.9;

    const updateOpacity = () => {
      const minimumOpacity = isMobileViewport ? minimumMobileOpacity : 0;
      const nextOpacity = Math.max(minimumOpacity, 1 - window.scrollY / fadeDistance);
      setHeaderOpacity(previousOpacity =>
        Math.abs(previousOpacity - nextOpacity) < 0.01 ? previousOpacity : nextOpacity
      );
      isTicking = false;
    };

    const handleScroll = () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateOpacity);
        isTicking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const hasCoBrand = Boolean(branding.coBrandLogo);

  return (
    <header
      className="site-header sticky inset-x-0 top-0 z-50 w-full pt-4 pb-2 md:pt-5 md:pb-3 lg:pt-5 lg:pb-4 transition-opacity"
      style={{ opacity: headerOpacity }}
    >
      <div
        className={[
          'max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12 transition-all duration-300',
          notebookSidebarOpen ? 'mr-80 lg:mr-96' : '',
        ].join(' ').trim()}
      >
        <div className={`flex h-full min-h-0 w-full items-center justify-between ${hasCoBrand ? 'gap-2' : 'gap-3'}`}>
          <div className={`flex min-w-0 shrink-0 items-center ${hasCoBrand ? 'gap-2 sm:gap-3' : 'gap-4'}`}>
            <Link
              to="/"
              aria-label="Back to Home"
              className="flex shrink-0 items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            >
              <img
                src={branding.primaryLogo.src}
                alt=""
                className={
                  branding.primaryLogo.className ??
                  (hasCoBrand
                    ? 'h-10 w-auto max-h-10 object-contain object-left sm:h-11 sm:max-h-11 md:h-12 md:max-h-12'
                    : 'h-12 w-auto max-h-12 object-contain object-left sm:h-14 sm:max-h-14 md:h-16 md:max-h-16')
                }
              />
            </Link>

            {branding.coBrandLogo && (
              <>
                <div
                  className={
                    branding.coBrandDividerClassName ?? 'site-header-divider h-9 sm:h-10 md:h-12 w-px'
                  }
                />
                <img
                  src={branding.coBrandLogo.src}
                  alt={branding.coBrandLogo.alt}
                  className={branding.coBrandLogo.className ?? 'h-9 sm:h-10 md:h-12 w-auto object-contain'}
                />
              </>
            )}
          </div>

          <div className={`flex min-w-0 shrink-0 items-center ${hasCoBrand ? 'gap-1 sm:gap-2' : 'gap-1 sm:gap-3'}`}>
            {showNotebookLink && (
              <Link
                to="/notebook"
                className={HERO_CTA_FOCUS_CLASS}
                aria-current={location.pathname === '/notebook' ? 'page' : undefined}
              >
                <HeroCtaPillSurface variant="light" headerNav headerNavCompact={hasCoBrand} onDarkBackground>
                  <span className="flex items-center justify-center gap-2">
                    <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Custom Deal Builder</span>
                    {notebookCount > 0 && (
                      <span className="ml-0.5 min-w-[18px] rounded-full bg-[rgb(13,18,38)]/10 px-1.5 py-0.5 text-center text-xs font-bold text-[rgb(13,18,38)]">
                        {notebookCount}
                      </span>
                    )}
                  </span>
                </HeroCtaPillSurface>
              </Link>
            )}
            <a
              href="https://geniussports.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${HERO_CTA_HEADER_LINK_CLASS} hidden min-w-0 sm:inline-flex ${hasCoBrand ? 'max-w-[12rem] xl:max-w-[20.9375rem]' : ''}`}
            >
              <HeroCtaPillSurface variant="light" headerNav headerNavCompact={hasCoBrand} onDarkBackground>
                {hasCoBrand ? (
                  <>
                    <span className="hidden xl:inline">Visit Genius Sports</span>
                    <span className="xl:hidden">Visit GS</span>
                  </>
                ) : (
                  <>
                    <span className="inline sm:hidden">Visit GS</span>
                    <span className="hidden sm:inline">Visit Genius Sports</span>
                  </>
                )}
              </HeroCtaPillSurface>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
