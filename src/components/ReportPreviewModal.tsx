import { X } from 'lucide-react';
import mediaGuidePreview1 from '../assets/media_guide_preview_1.png';
import mediaGuidePreview2 from '../assets/media_guide_preview_2.png';

interface ReportPreviewModalProps {
  reportTitle: string;
  onClose: () => void;
}

export function ReportPreviewModal({ reportTitle, onClose }: ReportPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gs-surface border border-gs-border rounded-lg shadow-xl max-w-[46rem] w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-gs-surface p-4 flex items-center justify-between gap-4 z-10 border-b border-gs-border">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gs-primary-900 truncate">
              2026 Genius Sports Media Planning Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gs-muted hover:text-gs-primary-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 pt-0">
          <div className="space-y-6">
            <div className="border border-gs-border rounded-lg overflow-hidden shadow-md">
              <img
                src={mediaGuidePreview1}
                alt="Report Preview Page 1"
                className="w-full h-auto"
              />
            </div>

            <div className="border border-gs-border rounded-lg overflow-hidden shadow-md">
              <img
                src={mediaGuidePreview2}
                alt="Report Preview Page 2"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
