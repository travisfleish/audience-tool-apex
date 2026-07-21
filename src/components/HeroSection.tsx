import type { ReactNode } from 'react';

type HeroSectionProps = {
  children: ReactNode;
  className?: string;
};

export function HeroSection({ children, className = '' }: HeroSectionProps) {
  return (
    <section className={`hero-section w-full bg-gs-primary-900 ${className}`.trim()}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12">
        {children}
      </div>
    </section>
  );
}
