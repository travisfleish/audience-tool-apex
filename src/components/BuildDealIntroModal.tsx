import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export type BuildDealIntroVariant = 'audience-added' | 'moment-added';

type BuildDealIntroModalProps = {
  variant: BuildDealIntroVariant;
  onClose: () => void;
  onContinue: () => void;
};

const COPY: Record<
  BuildDealIntroVariant,
  { added: ReactNode; continueLabel: string }
> = {
  'audience-added': {
    added: (
      <>
        Your audience has been added. Next, scroll to the{' '}
        <strong className="font-semibold text-gs-text">Genius Moments</strong> section and add one moment to
        complete your deal.
      </>
    ),
    continueLabel: 'Add a moment',
  },
  'moment-added': {
    added: (
      <>
        Your moment has been added. Next, scroll to the{' '}
        <strong className="font-semibold text-gs-text">Genius Audiences</strong> section and add one audience to
        complete your deal.
      </>
    ),
    continueLabel: 'Add an audience',
  },
};

export function BuildDealIntroModal({ variant, onClose, onContinue }: BuildDealIntroModalProps) {
  const { added, continueLabel } = COPY[variant];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-xl border border-gs-border bg-gs-surface p-6 shadow-2xl">
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
          <p>{added}</p>
          <p>
            You can only build one deal at a time — one audience and one moment. Remove either item from the deal
            builder to swap your selection.
          </p>
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
            className="flex-1 rounded-md bg-gs-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gs-accent-600"
          >
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
