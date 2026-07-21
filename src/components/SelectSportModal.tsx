import { X } from 'lucide-react';
import { SportToggle } from './SportToggle';
import { MOMENT_AUDIENCE_SPORT_FILTERS } from '../core/audienceSportFilters';

type SelectSportModalProps = {
  onClose: () => void;
  onSportSelect: (sportSlug: string) => void;
};

export function SelectSportModal({ onClose, onSportSelect }: SelectSportModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 max-md:p-3 md:items-center">
      <div className="relative w-full max-w-4xl rounded-xl border border-gs-border bg-gs-surface p-4 shadow-2xl max-md:max-h-[90vh] max-md:overflow-y-auto max-md:rounded-b-none md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gs-muted transition-colors hover:text-gs-text"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-8 text-xl font-bold text-gs-primary-900">Choose a sport</h2>
        <p className="mt-2 text-sm leading-relaxed text-gs-muted">
          Select a sport to activate or add a moment to your deal. Every moment is tied to a sport.
        </p>

        <div className="mt-6">
          <SportToggle
            sports={MOMENT_AUDIENCE_SPORT_FILTERS}
            selectedSport={null}
            onSportChange={onSportSelect}
            hideLabel
            variant="hero"
            columns={4}
            chipClassName="max-md:whitespace-normal md:whitespace-nowrap"
          />
        </div>
      </div>
    </div>
  );
}
