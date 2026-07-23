import { useState, type FormEvent } from 'react';
import { Check, CheckCircle2, Loader2, X } from 'lucide-react';
import { APEX_INVENTORY_CHANNELS } from '../config';
import { formatApexMomentLabel, type ApexDeal } from '../apexDeal';
import { useApexGate } from '../ApexGateContext';

type ApexSubmitModalProps = {
  deal: ApexDeal;
  onClose: () => void;
  onSubmitted: () => void;
};

const EXCLUSIVE_CHANNELS = new Set(['Not sure yet']);

export function ApexSubmitModal({ deal, onClose, onSubmitted }: ApexSubmitModalProps) {
  const { session } = useApexGate();
  const [brand, setBrand] = useState('');
  const [inventoryChannels, setInventoryChannels] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleChannel = (channel: string) => {
    setError('');
    setInventoryChannels(current => {
      const isSelected = current.includes(channel);
      if (isSelected) {
        return current.filter(item => item !== channel);
      }
      if (EXCLUSIVE_CHANNELS.has(channel)) {
        return [channel];
      }
      return [...current.filter(item => !EXCLUSIVE_CHANNELS.has(item)), channel];
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!brand.trim()) {
      setError('Add the brand / account for this inquiry.');
      return;
    }
    if (inventoryChannels.length === 0) {
      setError('Select at least one inventory channel.');
      return;
    }

    const name = (session?.name ?? '').trim();
    const email = (session?.email ?? '').trim().toLowerCase();
    if (!name || !email) {
      setError('Sign in at the gate again, then resubmit.');
      return;
    }

    const preferredInventoryChannel = inventoryChannels.join(', ');

    setIsSubmitting(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-activation-request`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestor_email: email,
          requestor_name: name,
          brand: brand.trim(),
          preferred_inventory_channel: preferredInventoryChannel,
          notes: notes.trim() || null,
          app_variant: import.meta.env.VITE_APP_VARIANT || 'apex',
          request_kind: 'apex_moment_rfp',
          deal_payload: {
            sport: deal.sport,
            vertical: deal.vertical,
            sub_verticals: deal.subVerticals,
            moments: deal.moments,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(
          typeof data?.error === 'string' && data.error.trim().length > 0
            ? data.error
            : 'Failed to submit request. Please try again.',
        );
      }

      setSubmitted(true);
      onSubmitted();
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      setError(message && message.trim().length > 0 ? message : 'Something went wrong. Please try again.');
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

            <fieldset>
              <legend className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
                Inventory channels
              </legend>
              <p className="mb-3 text-sm text-[var(--apex-text-muted)]">
                Select all that apply — for example Display and OLV.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {APEX_INVENTORY_CHANNELS.map(channel => {
                  const isSelected = inventoryChannels.includes(channel);
                  return (
                    <button
                      key={channel}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleChannel(channel)}
                      className={[
                        'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition',
                        isSelected
                          ? 'border-[var(--apex-accent)] bg-[var(--apex-glow)] font-medium text-[var(--apex-accent)]'
                          : 'border-[var(--apex-line)] bg-[var(--apex-panel-lift)] text-[var(--apex-text)] hover:border-[var(--apex-line-strong)]',
                      ].join(' ')}
                    >
                      {isSelected ? (
                        <Check className="h-4 w-4 shrink-0" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 rounded border border-[var(--apex-line-strong)]" />
                      )}
                      {channel}
                    </button>
                  );
                })}
              </div>
            </fieldset>

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
