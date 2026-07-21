import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, CheckCircle2, ChevronDown, Loader2, X } from 'lucide-react';
import { APEX_INVENTORY_CHANNELS } from '../config';
import { formatApexMomentLabel, type ApexDeal } from '../apexDeal';
import { useApexGate } from '../ApexGateContext';

type ApexSubmitModalProps = {
  deal: ApexDeal;
  onClose: () => void;
  onSubmitted: () => void;
};

export function ApexSubmitModal({ deal, onClose, onSubmitted }: ApexSubmitModalProps) {
  const { session } = useApexGate();
  const [brand, setBrand] = useState('');
  const [inventoryChannel, setInventoryChannel] = useState('');
  const [channelOpen, setChannelOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const channelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!channelOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!channelRef.current?.contains(event.target as Node)) {
        setChannelOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setChannelOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [channelOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!brand.trim()) {
      setError('Add the brand / account for this inquiry.');
      return;
    }
    if (!inventoryChannel) {
      setError('Select an inventory channel.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Scaffold: log payload locally. Wire to submit-activation-request next.
      const payload = {
        app_variant: 'apex',
        request_kind: 'apex_moment_rfp',
        name: session?.name ?? '',
        email: session?.email ?? '',
        brand: brand.trim(),
        inventory_channel: inventoryChannel,
        notes: notes.trim(),
        sport: deal.sport,
        vertical: deal.vertical,
        sub_verticals: deal.subVerticals,
        moments: deal.moments,
      };
      console.info('[apex] submit RFP payload', payload);
      await new Promise(resolve => setTimeout(resolve, 600));
      setSubmitted(true);
      onSubmitted();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-t-2xl border border-[var(--apex-line)] bg-[var(--apex-panel)] shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-[var(--apex-line)] bg-[var(--apex-panel-lift)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--apex-text)]">
              Submit for custom moment recommendations
            </h2>
            <p className="mt-1 text-sm text-[var(--apex-text-muted)]">
              We’ll follow up with a tailored Apex solution.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--apex-text-muted)] hover:bg-[var(--apex-ink-soft)] hover:text-[var(--apex-text)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-[var(--apex-accent)]" />
            <p className="text-lg font-semibold">Request received</p>
            <p className="text-sm text-[var(--apex-text-muted)]">
              Thanks — your custom Apex moment inquiry is in.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg bg-[var(--apex-accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <div className="rounded-xl border border-[var(--apex-line)] bg-[var(--apex-ink-soft)] p-3 text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
                Your package
              </p>
              <ul className="mt-2 space-y-1 text-[var(--apex-text)]">
                <li>
                  <span className="text-[var(--apex-text-muted)]">Sport:</span> {deal.sport?.label}
                </li>
                <li>
                  <span className="text-[var(--apex-text-muted)]">Vertical:</span>{' '}
                  {deal.vertical?.label}
                  {deal.subVerticals.length
                    ? ` · ${deal.subVerticals.map(s => s.label).join(', ')}`
                    : ''}
                </li>
                <li>
                  <span className="text-[var(--apex-text-muted)]">Moments:</span>{' '}
                  {deal.moments.map(formatApexMomentLabel).join('; ') || '—'}
                </li>
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
                  Name
                </label>
                <input
                  value={session?.name ?? ''}
                  readOnly
                  className="w-full rounded-lg border border-[var(--apex-line)] bg-[var(--apex-ink-soft)] px-3 py-2.5 text-sm text-[var(--apex-text-muted)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
                  Email
                </label>
                <input
                  value={session?.email ?? ''}
                  readOnly
                  className="w-full rounded-lg border border-[var(--apex-line)] bg-[var(--apex-ink-soft)] px-3 py-2.5 text-sm text-[var(--apex-text-muted)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="apex-brand" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
                Brand / account
              </label>
              <input
                id="apex-brand"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--apex-line-strong)] bg-[var(--apex-panel-lift)] px-3 py-2.5 text-sm outline-none focus:border-[var(--apex-accent)] focus:ring-2 focus:ring-[var(--apex-glow)]"
                placeholder="Brand this inquiry is for"
              />
            </div>

            <div ref={channelRef} className="relative">
              <label htmlFor="apex-inventory" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
                Inventory channel
              </label>
              <button
                id="apex-inventory"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={channelOpen}
                onClick={() => setChannelOpen(prev => !prev)}
                className="relative w-full rounded-lg border border-[var(--apex-line-strong)] bg-[var(--apex-panel-lift)] px-3 py-2.5 pr-10 text-left text-sm outline-none focus:border-[var(--apex-accent)] focus:ring-2 focus:ring-[var(--apex-glow)]"
              >
                <span className={inventoryChannel ? 'text-[var(--apex-text)]' : 'text-[var(--apex-text-muted)]'}>
                  {inventoryChannel || 'Select channel'}
                </span>
                <ChevronDown
                  className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--apex-text-muted)] transition-transform ${channelOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {channelOpen ? (
                <div
                  role="listbox"
                  aria-labelledby="apex-inventory"
                  className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-lg border border-[var(--apex-line)] bg-[var(--apex-panel)] shadow-[0_12px_40px_rgba(12,18,32,0.12)]"
                >
                  <div className="max-h-64 overflow-auto py-1">
                    {APEX_INVENTORY_CHANNELS.map(channel => {
                      const isSelected = inventoryChannel === channel;
                      return (
                        <button
                          key={channel}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setInventoryChannel(channel);
                            setChannelOpen(false);
                            setError('');
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                            isSelected
                              ? 'bg-[var(--apex-glow)] font-medium text-[var(--apex-accent)]'
                              : 'text-[var(--apex-text)] hover:bg-[var(--apex-ink-soft)]'
                          }`}
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                            {isSelected ? <Check className="h-4 w-4" /> : null}
                          </span>
                          {channel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="apex-notes" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
                Additional RFP / brief information
              </label>
              <textarea
                id="apex-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-[var(--apex-line-strong)] bg-[var(--apex-panel-lift)] px-3 py-2.5 text-sm outline-none focus:border-[var(--apex-accent)] focus:ring-2 focus:ring-[var(--apex-glow)]"
                placeholder="Paste brief details, timing, or anything else James & Tim should know…"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--apex-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--apex-accent-deep)] hover:text-white disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
