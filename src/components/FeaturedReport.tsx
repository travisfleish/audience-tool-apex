import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Report } from '../lib/supabase';
import { ReportPreviewModal } from './ReportPreviewModal';
import { HERO_CTA_FOCUS_CLASS, HeroCtaPillSurface } from './ui/HeroCtaPill';

interface FeaturedReportProps {
  report: Report;
}

export function FeaturedReport({ report }: FeaturedReportProps) {
  const [showPreview, setShowPreview] = useState(false);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownloadReport = () => {
    if (report.download_url) {
      window.open(report.download_url, '_blank');
    }
  };

  return (
    <section className="page-section-gap">
      <div className="pt-8 pb-12 sm:pt-10 sm:pb-14 text-center">
        <h2 className="hero-display-title">
          <span className="block">Genius Sports</span>
          <span className="block">2026 Sports Media Planning Guide</span>
        </h2>
      </div>

      <div className="bg-gs-surface rounded-lg shadow-md overflow-hidden border border-gs-border hover:shadow-lg transition-shadow">
        <div className="md:hidden">
          <div className="aspect-[4/3] overflow-hidden bg-gs-bg-muted">
            <img
              src={report.preview_image_url}
              alt={report.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={handleDownloadReport} className={HERO_CTA_FOCUS_CLASS}>
                <HeroCtaPillSurface>Download</HeroCtaPillSurface>
              </button>
              <button type="button" onClick={() => setShowPreview(true)} className={HERO_CTA_FOCUS_CLASS}>
                <HeroCtaPillSurface variant="light" lightPairedWithDark>
                  Preview
                </HeroCtaPillSurface>
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 gap-0">
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-gs-bg-muted">
            <img
              src={report.preview_image_url}
              alt={report.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-gs-accent-500 text-white text-xs font-bold rounded-full shadow-sm">
                NEW
              </span>
            </div>
          </div>

          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gs-muted mb-3">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(report.published_date)}</span>
              </div>

              <p className="text-gs-muted leading-relaxed mb-6">
                {report.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={handleDownloadReport} className={HERO_CTA_FOCUS_CLASS}>
                <HeroCtaPillSurface>Download</HeroCtaPillSurface>
              </button>
              <button type="button" onClick={() => setShowPreview(true)} className={HERO_CTA_FOCUS_CLASS}>
                <HeroCtaPillSurface variant="light" lightPairedWithDark>
                  Preview
                </HeroCtaPillSurface>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <ReportPreviewModal
          reportTitle={report.title}
          onClose={() => setShowPreview(false)}
        />
      )}
    </section>
  );
}
