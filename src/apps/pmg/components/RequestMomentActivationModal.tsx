import { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type { MomentActivationTarget } from '../../../core/moments/types';
import { DspDropdown } from './DspDropdown';
import { formatFlightDatesForEmail } from '../../../utils/formatFlightDates';

function getAppVariant(): string | null {
  return import.meta.env.VITE_APP_VARIANT || null;
}

function capitalizeSegment(segment: string): string {
  const lower = segment.toLowerCase();
  if (lower.length === 0) return segment;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function titleCaseCompoundWord(word: string): string {
  return word
    .split('/')
    .map(slashPart => slashPart.split('-').map(capitalizeSegment).join('-'))
    .join('/');
}

function toTitleCase(value: string): string {
  const lowercaseWords = new Set(['a', 'an', 'and', 'at', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'v']);
  const words = value.toLowerCase().split(' ');

  return words
    .map((word, index) => {
      const isEdgeWord = index === 0 || index === words.length - 1;
      const isPlainToken = !word.includes('/') && !word.includes('-');
      if (isPlainToken && !isEdgeWord && lowercaseWords.has(word)) return word;
      return titleCaseCompoundWord(word);
    })
    .join(' ');
}

const DSP_OPTIONS = [
  'Amazon',
  'Basis',
  'Beeswax',
  'DV360',
  'Facebook',
  'The Trade Desk',
  'Roku',
  'Simpli.fi',
  'Snapchat',
  'StackAdapt',
  'TikTok',
  'Viant',
  'X',
  'Xandr',
  'Yahoo',
  'Other',
] as const;

type DspOption = typeof DSP_OPTIONS[number];

type RequestMomentActivationModalProps = {
  onClose: () => void;
  moment?: MomentActivationTarget | null;
};

export function RequestMomentActivationModal({ onClose, moment }: RequestMomentActivationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    flightStart: '',
    flightEnd: '',
    dsps: [] as DspOption[],
    dspOther: '',
    dspSeatIds: {} as Record<string, string>,
    preferredInventoryChannel: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const momentLabel = useMemo(() => {
    if (!moment) return 'Genius Sports Moments';
    const parts = [toTitleCase(moment.name)];
    if (moment.sportLabel) parts.push(moment.sportLabel);
    return parts.join(' · ');
  }, [moment]);
  const momentDisplayName = useMemo(() => {
    if (!moment) return 'Genius Sports Moments';
    const categoryLabel =
      moment.category === 'mindset' ? 'Mindset' : moment.category === 'emotion' ? 'Emotion' : 'Context';
    const parts = [categoryLabel, toTitleCase(moment.name)];
    if (moment.sportLabel) parts.push(moment.sportLabel);
    return parts.join(' - ');
  }, [moment]);
  const isOtherSelected = formData.dsps.includes('Other');
  const selectedDspValues = useMemo(
    () =>
      formData.dsps
        .map((dsp) => (dsp === 'Other' ? formData.dspOther.trim() : dsp))
        .filter((dsp) => dsp.length > 0),
    [formData.dsps, formData.dspOther],
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, company: e.target.value }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  };

  const handleDspMultiChange = (nextValues: string[]) => {
    const nextDsps = nextValues as DspOption[];
    setFormData(prev => ({
      ...prev,
      dsps: nextDsps,
      dspOther: nextDsps.includes('Other') ? prev.dspOther : '',
      dspSeatIds: Object.fromEntries(
        Object.entries(prev.dspSeatIds).filter(([dspKey]) => nextDsps.includes(dspKey as DspOption))
      ),
    }));
  };

  const handleDspOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, dspOther: e.target.value }));
  };

  const handleDspSeatIdChange = (dspKey: DspOption, value: string) => {
    setFormData(prev => ({
      ...prev,
      dspSeatIds: {
        ...prev.dspSeatIds,
        [dspKey]: value,
      },
    }));
  };

  const handlePreferredInventoryChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, preferredInventoryChannel: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const selectedDsp = selectedDspValues.join(', ');
      const dspSeatIdEntries = formData.dsps
        .map(dsp => ({
          dspKey: dsp,
          platform: dsp === 'Other' ? formData.dspOther.trim() : dsp,
          seatId: (formData.dspSeatIds[dsp] ?? '').trim(),
        }))
        .filter(entry => entry.platform.length > 0 && entry.seatId.length > 0);
      const serializedDspSeatIds = dspSeatIdEntries
        .map(entry => `${entry.platform}: ${entry.seatId}`)
        .join(' | ');
      const audiences = [
        {
          id: moment?.id ?? 'genius-sports-moments',
          name: momentDisplayName,
          displayName: momentDisplayName,
        },
      ];
      const flightDates = formatFlightDatesForEmail(formData.flightStart, formData.flightEnd);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-activation-request`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestor_email: formData.email.trim(),
          requestor_name: formData.name.trim(),
          requestor_company: formData.company.trim(),
          dsp: selectedDsp,
          dsp_platforms: selectedDspValues,
          dsp_seat_id: serializedDspSeatIds,
          dsp_seat_ids: dspSeatIdEntries.map(({ platform, seatId }) => ({ platform, seatId })),
          preferred_inventory_channel: formData.preferredInventoryChannel.trim(),
          flight_dates: flightDates,
          flight_start: formData.flightStart,
          flight_end: formData.flightEnd.trim() || null,
          notes: formData.notes?.trim() || null,
          app_variant: getAppVariant(),
          request_kind: 'moment',
          audiences,
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
    } catch (err) {
      console.error('Error submitting activation request:', err);
      const message = err instanceof Error ? err.message : null;
      setError(message && message.trim().length > 0 ? message : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.company.trim().length > 0 &&
    formData.flightStart.trim().length > 0 &&
    selectedDspValues.length > 0 &&
    (!isOtherSelected || formData.dspOther.trim().length > 0) &&
    !isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-4xl rounded-xl border border-pmg-border bg-pmg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-pmg-muted transition-colors hover:text-pmg-text"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pmg-accent/10">
              <span className="text-xl font-bold text-pmg-accent" aria-hidden="true">✓</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-pmg-text">Request Received</h2>
            <p className="mb-6 text-sm text-pmg-muted">
              Your Deal ID request for <span className="font-medium text-pmg-text">{momentLabel}</span> has been
              submitted. Our Deal Desk team will send setup instructions shortly.
            </p>
            <button
              onClick={onClose}
              className="rounded-lg bg-pmg-accent px-6 py-2.5 font-semibold text-white transition-all hover:bg-pmg-accent/90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-1">
              <h2 className="text-xl font-bold text-pmg-text">Get Started</h2>
            </div>
            <p className="mb-5 text-sm text-pmg-muted">
              {momentLabel}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="moment-act-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="moment-act-name"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="moment-act-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="moment-act-email"
                      required
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="moment-act-company" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="moment-act-company"
                      required
                      value={formData.company}
                      onChange={handleCompanyChange}
                      className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      placeholder="Acme Media"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="moment-act-flight-start" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                        Flight Date *
                      </label>
                      <input
                        type="date"
                        id="moment-act-flight-start"
                        required
                        value={formData.flightStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, flightStart: e.target.value }))}
                        className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="moment-act-flight-end" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                        Flight End <span className="normal-case font-normal text-pmg-muted">(optional)</span>
                      </label>
                      <input
                        type="date"
                        id="moment-act-flight-end"
                        value={formData.flightEnd}
                        min={formData.flightStart || undefined}
                        onChange={(e) => setFormData(prev => ({ ...prev, flightEnd: e.target.value }))}
                        className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      DSP or Platform *
                    </label>
                    <DspDropdown
                      id="moment-act-dsp"
                      value=""
                      values={formData.dsps}
                      options={DSP_OPTIONS}
                      placeholder="Select one or more DSPs"
                      onMultiChange={handleDspMultiChange}
                      multiple
                    />
                  </div>

                  {isOtherSelected && (
                    <div>
                      <label htmlFor="moment-act-dsp-other" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                        Please specify DSP *
                      </label>
                      <input
                        type="text"
                        id="moment-act-dsp-other"
                        required
                        value={formData.dspOther}
                        onChange={handleDspOtherChange}
                        className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                        placeholder="Enter DSP name"
                      />
                    </div>
                  )}

                  {formData.dsps.map((dsp) => {
                    const label = dsp === 'Other' ? (formData.dspOther.trim() || 'Other') : dsp;
                    return (
                      <div key={`moment-act-seat-id-${dsp}`}>
                        <label htmlFor={`moment-act-seat-id-${dsp}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                          {label} DSP Seat ID <span className="normal-case font-normal text-pmg-muted">(optional)</span>
                        </label>
                        <input
                          type="text"
                          id={`moment-act-seat-id-${dsp}`}
                          value={formData.dspSeatIds[dsp] ?? ''}
                          onChange={(e) => handleDspSeatIdChange(dsp, e.target.value)}
                          className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                          placeholder={`Enter ${label} DSP Seat ID`}
                        />
                      </div>
                    );
                  })}

                  <div>
                    <label htmlFor="moment-act-inventory" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      Preferred Inventory Channel <span className="normal-case font-normal text-pmg-muted">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="moment-act-inventory"
                      value={formData.preferredInventoryChannel}
                      onChange={handlePreferredInventoryChannelChange}
                      className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      placeholder="Display, Video, CTV, etc."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="moment-act-notes" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                  Notes <span className="normal-case font-normal text-pmg-muted">(optional)</span>
                </label>
                <textarea
                  id="moment-act-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleNotesChange}
                  className="w-full resize-none rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                  placeholder="Any additional setup context..."
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg border border-pmg-border px-4 py-2.5 text-sm font-semibold text-pmg-text transition-colors hover:bg-pmg-bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pmg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-pmg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Me the Deal ID'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
