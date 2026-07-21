import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { NOTEBOOK_ENABLED } from '../../../core/featureFlags';
import { pmgConfig } from '../config';
import { HERO_CTA_FOCUS_CLASS, HeroCtaPillSurface } from '../../../components/ui/HeroCtaPill';

interface PmgLayoutProps {
  children: ReactNode;
  notebookCount?: number;
}

export function PmgLayout({ children, notebookCount = 0 }: PmgLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Audiences', href: '/' },
    { label: 'Moments', href: '/#moments' },
    { label: 'Planning Guide', href: '/#planning' },
  ];

  return (
    <div className="min-h-screen bg-pmg-bg flex flex-col">
      <header className="site-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-pmg-accent rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-white text-sm tracking-wide hidden sm:block">
                {pmgConfig.appName}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`site-header-nav px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.href ? 'site-header-nav-active' : ''
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {NOTEBOOK_ENABLED && (
                <Link
                  to="/notebook"
                  className={HERO_CTA_FOCUS_CLASS}
                  aria-current={location.pathname === '/notebook' ? 'page' : undefined}
                >
                  <HeroCtaPillSurface variant="light" onDarkBackground>
                    <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
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

              <button
                className="site-header-nav md:hidden p-2 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="site-header-nav block px-3 py-2 rounded-md text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-pmg-border bg-pmg-surface py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pmg-accent rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-pmg-muted text-sm">
                Powered by Genius Sports
              </span>
            </div>
            <p className="text-pmg-muted text-sm">
              &copy; {new Date().getFullYear()} Genius Sports. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
