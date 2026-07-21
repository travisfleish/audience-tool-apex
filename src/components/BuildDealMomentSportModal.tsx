import { X } from 'lucide-react';
import { SportToggle } from './SportToggle';
import { MOMENT_AUDIENCE_SPORT_FILTERS } from '../core/audienceSportFilters';
import { ModalPortal } from './ModalPortal';

type BuildDealMomentSportModalProps = {
  selectedSport: string | null;
  onSportSelect: (sportSlug: string) => void;
  onClose: () => void;
  onContinue: () => void;
};

export function BuildDealMomentSportModal({
  selectedSport,
  onSportSelect,
  onClose,
  onContinue,
}: BuildDealMomentSportModalProps) {
  const momentAdded = selectedSport !== null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60]">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" aria-hidden />
        <div className="relative flex min-h-full items-end justify-center p-4 max-md:p-3 md:items-center">
          <div className="relative w-full max-w-4xl rounded-xl border border-gs-border bg-gs-surface p-4 shadow-2xl max-md:max-h-[90vh] max-md:overflow-y-auto max-md:rounded-b-none md:p-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-gs-muted transition-colors hover:text-gs-text"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="pr-8 text-xl font-bold text-gs-primary-900">Build your deal</h2>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-gs-muted">
              <p>
                Choose a sport to add your moment. Every moment is tied to a sport — then add one audience to
                complete your deal.
              </p>
              {momentAdded ? (
                <p>
                  Your moment has been added. Next, scroll to the{' '}
                  <strong className="font-semibold text-gs-text">Genius Audiences</strong> section and add one
                  audience to complete your deal.
                </p>
              ) : null}
              <p>
                You can only build one deal at a time — one audience and one moment. Remove either item from the
                deal builder to swap your selection.
              </p>
            </div>

            <div className="mt-6">
              <SportToggle
                sports={MOMENT_AUDIENCE_SPORT_FILTERS}
                selectedSport={selectedSport}
                onSportChange={onSportSelect}
                hideLabel
                variant="hero"
                columns={4}
                chipClassName="max-md:whitespace-normal md:whitespace-nowrap"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-gs-border px-4 py-2.5 text-sm font-semibold text-gs-text transition-colors hover:bg-gs-bg-muted"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={onContinue}
                disabled={!momentAdded}
                className="flex-1 rounded-md bg-gs-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gs-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add an audience
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
