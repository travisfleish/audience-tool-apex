import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Audience } from '../../../core/types';
import type { MomentActivationTarget } from '../../../core/moments/types';
import { formatMomentLabel } from '../../../core/dealBuilder';
import { DspDropdown } from './DspDropdown';

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

interface ActivateModalProps {
  audience: Audience;
  displayName: string;
  requestAudiences?: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
  moment?: MomentActivationTarget | null;
  onSubmitted?: () => void;
  onClose: () => void;
}

export function ActivateModal({
  audience,
  displayName,
  requestAudiences,
  moment = null,
  onSubmitted,
  onClose,
}: ActivateModalProps) {
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
      const selectedDsps = formData.dsps
        .map(dsp => (dsp === 'Other' ? formData.dspOther.trim() : dsp))
        .filter(dsp => dsp.length > 0);
      const dspSeatIdEntries = formData.dsps
        .map(dsp => ({
          dspKey: dsp,
          platform: dsp === 'Other' ? formData.dspOther.trim() : dsp,
          seatId: (formData.dspSeatIds[dsp] ?? '').trim(),
        }))
        .filter(entry => entry.platform.length > 0 && entry.seatId.length > 0);
      const selectedDsp = selectedDsps.join(', ');
      const serializedDspSeatIds = dspSeatIdEntries
        .map(entry => `${entry.platform}: ${entry.seatId}`)
        .join(' | ');

      const audiences = requestAudiences && requestAudiences.length > 0
        ? requestAudiences
        : [{ id: audience.id, name: audience.name, displayName }];

      const isDealSubmission = !!moment;
      const momentLabel = moment ? formatMomentLabel(moment) : null;
      const flightDates = formData.flightEnd.trim()
        ? `${formData.flightStart} – ${formData.flightEnd}`
        : formData.flightStart;

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
          dsp_platforms: selectedDsps,
          dsp_seat_id: serializedDspSeatIds,
          dsp_seat_ids: dspSeatIdEntries.map(({ platform, seatId }) => ({ platform, seatId })),
          preferred_inventory_channel: formData.preferredInventoryChannel.trim(),
          flight_dates: flightDates,
          flight_start: formData.flightStart,
          flight_end: formData.flightEnd.trim() || null,
          notes: formData.notes?.trim() || null,
          app_variant: getAppVariant(),
          request_kind: isDealSubmission ? 'deal' : 'audience',
          audiences,
          moment: isDealSubmission && moment && momentLabel
            ? {
                id: moment.id,
                name: moment.name,
                displayName: momentLabel,
              }
            : null,
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
      onSubmitted?.();
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
    formData.dsps.length > 0 &&
    (!formData.dsps.includes('Other') || formData.dspOther.trim().length > 0) &&
    !isSubmitting;
  const isNotebookActivation = (requestAudiences?.length ?? 0) > 1;
  const isDealSubmission = !!moment;
  const successMessage = isDealSubmission
    ? 'Your custom deal has been submitted. Our Deal Desk team will send setup instructions shortly.'
    : isNotebookActivation
    ? 'Your Deal ID request for your custom deal builder has been submitted. Our Deal Desk team will send setup instructions shortly.'
    : `Your Deal ID request for ${displayName} has been submitted. Our Deal Desk team will send setup instructions shortly.`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4 max-md:p-3 md:items-center">
      <div className="bg-pmg-surface border border-pmg-border rounded-xl shadow-2xl w-full max-w-4xl p-4 relative max-md:max-h-[90vh] max-md:overflow-y-auto max-md:rounded-b-none md:p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-pmg-muted hover:text-pmg-text transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-pmg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-pmg-accent text-xl font-bold" aria-hidden="true">✓</span>
            </div>
            <h2 className="text-xl font-bold text-pmg-text mb-2">Request Received</h2>
            <p className="text-pmg-muted text-sm mb-6">
              {isNotebookActivation ? (
                successMessage
              ) : (
                <>
                  Your Deal ID request for <span className="font-medium text-pmg-text">{displayName}</span> has been submitted. Our Deal Desk team will send setup instructions shortly.
                </>
              )}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-pmg-accent text-white font-semibold rounded-lg hover:bg-pmg-accent/90 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-1">
              <h2 className="text-xl font-bold text-pmg-text">
                {isDealSubmission ? 'Submit Your Deal' : 'Get Started'}
              </h2>
            </div>
            <p className="text-pmg-muted text-sm mb-5">
              {isDealSubmission ? (
                <>
                  <span className="font-medium text-pmg-text">{displayName}</span>
                  {' + '}
                  <span className="font-medium text-pmg-text">{formatMomentLabel(moment)}</span>
                </>
              ) : (
                audience.name
              )}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="act-name" className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="act-name"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="act-email" className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="act-email"
                      required
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all"
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="act-company" className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="act-company"
                      required
                      value={formData.company}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all"
                      placeholder="Acme Media"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="act-flight-start" className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                        Flight Date *
                      </label>
                      <input
                        type="date"
                        id="act-flight-start"
                        required
                        value={formData.flightStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, flightStart: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="act-flight-end" className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                        Flight End <span className="text-pmg-muted normal-case font-normal">(optional)</span>
                      </label>
                      <input
                        type="date"
                        id="act-flight-end"
                        value={formData.flightEnd}
                        min={formData.flightStart || undefined}
                        onChange={(e) => setFormData(prev => ({ ...prev, flightEnd: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                      DSP or Platform *
                    </label>
                    <DspDropdown
                      id="act-dsp"
                      value=""
                      values={formData.dsps}
                      options={DSP_OPTIONS}
                      placeholder="Select one or more DSPs"
                      onMultiChange={handleDspMultiChange}
                      multiple
                    />
                  </div>

                  {formData.dsps.includes('Other') && (
                    <div>
                      <label htmlFor="act-dsp-other" className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                        Please specify DSP *
                      </label>
                      <input
                        type="text"
                        id="act-dsp-other"
                        required
                        value={formData.dspOther}
                        onChange={handleDspOtherChange}
                        className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all"
                        placeholder="Enter DSP name"
                      />
                    </div>
                  )}

                  {formData.dsps.map((dsp) => {
                    const label = dsp === 'Other' ? (formData.dspOther.trim() || 'Other') : dsp;
                    return (
                      <div key={`act-dsp-seat-id-${dsp}`}>
                        <label htmlFor={`act-dsp-seat-id-${dsp}`} className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                          {label} DSP Seat ID <span className="text-pmg-muted normal-case font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          id={`act-dsp-seat-id-${dsp}`}
                          value={formData.dspSeatIds[dsp] ?? ''}
                          onChange={(e) => handleDspSeatIdChange(dsp, e.target.value)}
                          className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all"
                          placeholder={`Enter ${label} DSP Seat ID`}
                        />
                      </div>
                    );
                  })}

                  <div>
                    <label htmlFor="act-preferred-inventory-channel" className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                      Preferred Inventory Channel <span className="text-pmg-muted normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="act-preferred-inventory-channel"
                      value={formData.preferredInventoryChannel}
                      onChange={handlePreferredInventoryChannelChange}
                      className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all"
                      placeholder="Display, Video, CTV, etc."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="act-notes" className="block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide">
                  Notes <span className="text-pmg-muted normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  id="act-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleNotesChange}
                  className="w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all resize-none"
                  placeholder="Any additional setup context..."
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-pmg-border text-pmg-text rounded-lg hover:bg-pmg-bg-muted transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 px-4 py-2.5 bg-pmg-accent text-white font-semibold rounded-lg hover:bg-pmg-accent/90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
