import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers3 } from 'lucide-react';
import { apexConfig } from '../config';
import { useApexGate } from '../ApexGateContext';

type ApexHeaderProps = {
  builderCount?: number;
  builderSidebarOpen?: boolean;
};

export function ApexHeader({ builderCount = 0, builderSidebarOpen = false }: ApexHeaderProps) {
  const { session, logout } = useApexGate();
  const branding = apexConfig.header;
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
        Math.abs(previousOpacity - nextOpacity) < 0.01 ? previousOpacity : nextOpacity,
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

  return (
    <header
      className="sticky inset-x-0 top-0 z-50 w-full pt-4 pb-2 transition-opacity md:pt-5 md:pb-3"
      style={{ opacity: headerOpacity }}
    >
      <div
        className={[
          'relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8',
          builderSidebarOpen ? 'mr-80 lg:mr-96' : '',
          'transition-all duration-300',
        ]
          .join(' ')
          .trim()}
      >
        <Link to="/" className="flex min-w-0 items-center gap-3 sm:gap-4" aria-label="Back to home">
          <img
            src={branding.primaryLogo.src}
            alt=""
            className={branding.primaryLogo.className}
          />
          {branding.coBrandLogo ? (
            <>
              <div className={branding.coBrandDividerClassName} />
              <img
                src={branding.coBrandLogo.src}
                alt={branding.coBrandLogo.alt}
                className={branding.coBrandLogo.className}
              />
            </>
          ) : null}
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--apex-line-strong)] bg-[var(--apex-ink-soft)] px-3 py-2 text-xs font-semibold text-[var(--apex-text)] backdrop-blur transition hover:border-[var(--apex-accent)] hover:bg-[var(--apex-glow)] sm:px-4 sm:text-sm"
          >
            <Layers3 className="h-4 w-4 text-[var(--apex-accent)]" aria-hidden />
            <span className="hidden sm:inline">Moment Builder</span>
            {builderCount > 0 ? (
              <span className="min-w-[1.25rem] rounded-full bg-[var(--apex-accent)] px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                {builderCount}
              </span>
            ) : null}
          </Link>
          {session ? (
            <button
              type="button"
              onClick={logout}
              className="hidden rounded-full border border-transparent px-3 py-2 text-xs text-[var(--apex-text-muted)] transition hover:text-[var(--apex-text)] sm:inline"
              title={session.email}
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
