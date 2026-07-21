import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PromoModuleConfig, PromoSlideConfig } from '../core/config/appConfig';

type PromoCarouselSectionProps = {
  module: PromoModuleConfig;
};

function renderBulletText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-gs-primary-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function PromoSlideMedia({ slide }: { slide: PromoSlideConfig }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slide.videoSrc || !videoRef.current || !containerRef.current) return;

    const video = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play();
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [slide.videoSrc]);

  if (!slide.videoSrc && !slide.imageSrc) return null;

  const isVideo = Boolean(slide.videoSrc);
  const fillHeight = slide.mediaFillHeight !== false;
  const stretchClasses = fillHeight ? 'md:aspect-auto md:min-h-[380px] md:h-full' : '';
  const containerBg = slide.mediaContainerClassName ?? 'bg-gs-bg-muted';
  const defaultImageAspect = `relative aspect-[4/3] overflow-hidden ${containerBg} ${stretchClasses}`;
  const imageContainerClassName = slide.mediaAspectClassName
    ? `relative w-full overflow-hidden ${containerBg} ${slide.mediaAspectClassName} ${stretchClasses}`
    : defaultImageAspect;

  return (
    <div
      ref={containerRef}
      className={
        isVideo
          ? 'relative aspect-video w-full overflow-hidden bg-black'
          : imageContainerClassName
      }
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={slide.videoSrc}
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className="w-full h-full object-contain"
          aria-label={slide.imageAlt ?? slide.title}
        />
      ) : (
        <img
          src={slide.imageSrc}
          alt={slide.imageAlt ?? slide.title}
          className={`w-full h-full ${slide.imageClassName ?? 'object-cover'}`}
        />
      )}
    </div>
  );
}

function PromoSlide({ slide }: { slide: PromoSlideConfig }) {
  const hasMedia = Boolean(slide.videoSrc || slide.imageSrc);
  const mediaGridClassName = slide.mediaGridClassName ?? 'md:grid-cols-[3fr_2fr]';
  const gridItemsClassName = slide.mediaFillHeight === false ? 'md:items-center' : 'md:items-stretch';
  const isCentered = slide.contentAlign === 'center';

  return (
    <div className="bg-gs-surface rounded-lg shadow-md overflow-hidden border border-gs-border">
      <div className={`grid gap-0${hasMedia ? ` ${mediaGridClassName} ${gridItemsClassName}` : ''}`}>
        {hasMedia ? <PromoSlideMedia slide={slide} /> : null}

        <div
          className={[
            'p-5 sm:p-6 md:p-8 flex flex-col justify-center',
            hasMedia ? 'md:min-h-full' : 'md:col-span-2',
            isCentered ? 'items-center text-center' : '',
          ].join(' ')}
        >
          <div
            className={
              isCentered
                ? [
                    'flex max-w-2xl flex-col items-center',
                    slide.footerLogo ? 'md:translate-y-6' : '',
                  ].join(' ')
                : undefined
            }
          >
            <h3
              className={[
                'font-bold text-gs-primary-900 mb-4 font-heading',
                isCentered ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl',
              ].join(' ')}
            >
              {slide.title}
            </h3>
            {slide.body ? (
              <p
                className={[
                  'text-gs-muted leading-relaxed',
                  isCentered ? 'text-lg sm:text-xl' : 'text-base',
                  isCentered && slide.footerLogo ? 'mb-2' : 'mb-4',
                ].join(' ')}
              >
                {slide.body}
              </p>
            ) : null}
            {slide.bulletGroups && slide.bulletGroups.length > 0 ? (
              <div className={`space-y-4${isCentered ? ' text-left' : ''}`}>
                {slide.bulletGroups.map((group) => (
                  <div key={group.title}>
                    <p className="text-sm font-semibold uppercase tracking-wide text-gs-primary-900 mb-2">
                      {group.title}
                    </p>
                    <ul className="space-y-2 text-gs-muted text-base leading-relaxed list-disc pl-5">
                      {group.bullets.map((bullet) => (
                        <li key={bullet}>{renderBulletText(bullet)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : slide.bullets && slide.bullets.length > 0 ? (
              <ul
                className={[
                  'space-y-2 text-gs-muted text-base leading-relaxed',
                  isCentered ? 'list-none pl-0' : 'list-disc pl-5',
                ].join(' ')}
              >
                {slide.bullets.map((bullet) => (
                  <li key={bullet}>{renderBulletText(bullet)}</li>
                ))}
              </ul>
            ) : null}
            {slide.footerLogo ? (
              <div className={isCentered ? 'mt-4 sm:mt-5' : 'mt-6 md:mt-8'}>
                <img
                  src={slide.footerLogo.src}
                  alt={slide.footerLogo.alt}
                  className={slide.footerLogo.className ?? 'h-9 w-auto'}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PromoCarouselSection({ module }: PromoCarouselSectionProps) {
  const { anchorId, title, subtitle, slides } = module;
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const minimumSwipeDistance = 50;

  useEffect(() => {
    setActiveIndex(0);
  }, [slides]);

  if (slides.length === 0) return null;

  const currentIndex = Math.min(activeIndex, slides.length - 1);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < slides.length - 1;

  const goPrev = () => {
    if (!canGoPrev) return;
    setActiveIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (!canGoNext) return;
    setActiveIndex((prev) => prev + 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const swipeDistance = endX - touchStartX.current;

    if (Math.abs(swipeDistance) >= minimumSwipeDistance) {
      if (swipeDistance < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartX.current = null;
  };

  return (
    <section id={anchorId} className="page-section-gap scroll-mt-24" aria-label={title}>
      <div className="pt-8 pb-12 sm:pt-10 sm:pb-14 text-center">
        <h2 className="hero-display-title">{title}</h2>
        {subtitle ? (
          <p className="mx-auto mt-3 max-w-4xl text-subhead font-normal text-pretty max-md:text-base max-md:leading-relaxed max-md:px-2 text-gs-muted">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="relative overflow-visible pb-7 md:pb-12">
        {module.decorImageSrc ? (
          <div
            className="pointer-events-none absolute right-0 bottom-0 z-0 hidden md:block w-[min(54%,26rem)] h-[92%] translate-x-[20%] translate-y-[8%]"
            aria-hidden="true"
          >
            <img
              src={module.decorImageSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-right-bottom opacity-85 mix-blend-screen"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 22%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.9) 100%)',
                maskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 22%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.9) 100%)',
              }}
            />
          </div>
        ) : null}

        <div
          className="relative z-10"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <PromoSlide slide={slides[currentIndex]} />
        </div>
      </div>

      {slides.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gs-border bg-gs-surface text-gs-primary-900 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Previous ${title} slide`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-sm text-gs-muted min-w-[64px] text-center">
            {currentIndex + 1} / {slides.length}
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gs-border bg-gs-surface text-gs-primary-900 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Next ${title} slide`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
