import { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { DspDropdown } from '../apps/pmg/components/DspDropdown';
import { APP_VARIANT } from '../appVariant';
import { getConfig } from '../core/config/getConfig';
import { formatFlightDatesForEmail } from '../utils/formatFlightDates';

const DEFAULT_CUSTOM_AUDIENCE_DESCRIPTION_PLACEHOLDER =
  'e.g. Fans of Premier League clubs who also purchase athletic footwear';

function getAppVariant(): string | null {
  return import.meta.env.VITE_APP_VARIANT || null;
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

type RequestCustomAudienceModalProps = {
  onClose: () => void;
};

export function RequestCustomAudienceModal({ onClose }: RequestCustomAudienceModalProps) {
  const audienceDescriptionPlaceholder =
    getConfig(APP_VARIANT).copy.customAudienceDescriptionPlaceholder ??
    DEFAULT_CUSTOM_AUDIENCE_DESCRIPTION_PLACEHOLDER;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    flightStart: '',
    flightEnd: '',
    audienceDescription: '',
    dsps: [] as DspOption[],
    dspOther: '',
    dspSeatIds: {} as Record<string, string>,
    preferredInventoryChannel: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isOtherSelected = formData.dsps.includes('Other');
  const selectedDspValues = useMemo(
    () =>
      formData.dsps
        .map((dsp) => (dsp === 'Other' ? formData.dspOther.trim() : dsp))
        .filter((dsp) => dsp.length > 0),
    [formData.dsps, formData.dspOther],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const selectedDsp = selectedDspValues.join(', ');
      const dspSeatIdEntries = formData.dsps
        .map((dsp) => ({
          dspKey: dsp,
          platform: dsp === 'Other' ? formData.dspOther.trim() : dsp,
          seatId: (formData.dspSeatIds[dsp] ?? '').trim(),
        }))
        .filter((entry) => entry.platform.length > 0 && entry.seatId.length > 0);
      const serializedDspSeatIds = dspSeatIdEntries
        .map((entry) => `${entry.platform}: ${entry.seatId}`)
        .join(' | ');
      const audienceDescription = formData.audienceDescription.trim();
      const audiences = [
        {
          id: 'custom-audience-request',
          name: 'Custom Audience Request',
          displayName: audienceDescription,
        },
      ];
      const combinedNotes = [audienceDescription, formData.notes?.trim() || null]
        .filter((value): value is string => Boolean(value && value.length > 0))
        .join('\n\n');
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
          notes: combinedNotes || null,
          app_variant: getAppVariant(),
          request_kind: 'audience',
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
      console.error('Error submitting custom audience request:', err);
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
    formData.audienceDescription.trim().length > 0 &&
    selectedDspValues.length > 0 &&
    (!isOtherSelected || formData.dspOther.trim().length > 0) &&
    !isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 max-md:p-3 md:items-center">
      <div className="relative w-full max-w-4xl rounded-xl border border-pmg-border bg-pmg-surface p-4 shadow-2xl max-md:max-h-[90vh] max-md:overflow-y-auto max-md:rounded-b-none md:p-6">
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
              Your custom audience request has been submitted. Our team will follow up shortly.
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
              <h2 className="text-xl font-bold text-pmg-text">Request a Custom Audience</h2>
            </div>
            <p className="mb-5 text-sm text-pmg-muted">
              Tell us about the audience you need and we&apos;ll build it from the Genius Fan Graph.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="custom-audience-description" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                  Describe your audience *
                </label>
                <textarea
                  id="custom-audience-description"
                  required
                  rows={3}
                  value={formData.audienceDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, audienceDescription: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                  placeholder={audienceDescriptionPlaceholder}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="custom-audience-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="custom-audience-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="custom-audience-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="custom-audience-email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="custom-audience-company" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="custom-audience-company"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                      className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      placeholder="Acme Media"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="custom-audience-flight-start" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                        Flight Date *
                      </label>
                      <input
                        type="date"
                        id="custom-audience-flight-start"
                        required
                        value={formData.flightStart}
                        onChange={(e) => setFormData((prev) => ({ ...prev, flightStart: e.target.value }))}
                        className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-audience-flight-end" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                        Flight End <span className="normal-case font-normal text-pmg-muted">(optional)</span>
                      </label>
                      <input
                        type="date"
                        id="custom-audience-flight-end"
                        value={formData.flightEnd}
                        min={formData.flightStart || undefined}
                        onChange={(e) => setFormData((prev) => ({ ...prev, flightEnd: e.target.value }))}
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
                      id="custom-audience-dsp"
                      value=""
                      values={formData.dsps}
                      options={DSP_OPTIONS}
                      placeholder="Select one or more DSPs"
                      onMultiChange={(nextValues) => {
                        const nextDsps = nextValues as DspOption[];
                        setFormData((prev) => ({
                          ...prev,
                          dsps: nextDsps,
                          dspOther: nextDsps.includes('Other') ? prev.dspOther : '',
                          dspSeatIds: Object.fromEntries(
                            Object.entries(prev.dspSeatIds).filter(([dspKey]) =>
                              nextDsps.includes(dspKey as DspOption),
                            ),
                          ),
                        }));
                      }}
                      multiple
                    />
                  </div>

                  {isOtherSelected && (
                    <div>
                      <label htmlFor="custom-audience-dsp-other" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                        Please specify DSP *
                      </label>
                      <input
                        type="text"
                        id="custom-audience-dsp-other"
                        required
                        value={formData.dspOther}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dspOther: e.target.value }))}
                        className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                        placeholder="Enter DSP name"
                      />
                    </div>
                  )}

                  {formData.dsps.map((dsp) => {
                    const label = dsp === 'Other' ? (formData.dspOther.trim() || 'Other') : dsp;
                    return (
                      <div key={`custom-audience-seat-id-${dsp}`}>
                        <label htmlFor={`custom-audience-seat-id-${dsp}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                          {label} DSP Seat ID <span className="normal-case font-normal text-pmg-muted">(optional)</span>
                        </label>
                        <input
                          type="text"
                          id={`custom-audience-seat-id-${dsp}`}
                          value={formData.dspSeatIds[dsp] ?? ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              dspSeatIds: {
                                ...prev.dspSeatIds,
                                [dsp]: e.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                          placeholder={`Enter ${label} DSP Seat ID`}
                        />
                      </div>
                    );
                  })}

                  <div>
                    <label htmlFor="custom-audience-inventory" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                      Preferred Inventory Channel <span className="normal-case font-normal text-pmg-muted">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="custom-audience-inventory"
                      value={formData.preferredInventoryChannel}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, preferredInventoryChannel: e.target.value }))
                      }
                      className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                      placeholder="Display, Video, CTV, etc."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="custom-audience-notes" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pmg-text">
                  Additional notes <span className="normal-case font-normal text-pmg-muted">(optional)</span>
                </label>
                <textarea
                  id="custom-audience-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-sm text-pmg-text placeholder-pmg-muted transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
                  placeholder="Timeline, campaign context, or other details..."
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
                    'Submit Request'
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
