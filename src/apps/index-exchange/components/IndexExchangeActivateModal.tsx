import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Audience } from '../../../core/types';
import { DspDropdown } from '../../pmg/components/DspDropdown';
import { indexExchangeConfig } from '../config';

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

type DspOption = (typeof DSP_OPTIONS)[number];

const SSP_OPTIONS = indexExchangeConfig.sspPreferenceOptions ?? ['No Preference'];

const inputClassName =
  'w-full px-3 py-2.5 bg-pmg-bg border border-pmg-border rounded-lg text-pmg-text placeholder-pmg-muted text-sm focus:outline-none focus:ring-2 focus:ring-pmg-accent/50 focus:border-pmg-accent transition-all';

const labelClassName = 'block text-xs font-semibold text-pmg-text mb-1 uppercase tracking-wide';

interface IndexExchangeActivateModalProps {
  audience: Audience;
  displayName: string;
  requestAudiences?: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
  onClose: () => void;
}

export function IndexExchangeActivateModal({
  audience,
  displayName,
  requestAudiences,
  onClose,
}: IndexExchangeActivateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    buyerSeat: '',
    campaignName: '',
    flightStart: '',
    flightEnd: '',
    approxBudget: '',
    sspPreference: 'No Preference',
    dsps: [] as DspOption[],
    dspOther: '',
    preferredInventoryChannel: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const selectedDsps = formData.dsps
        .map(dsp => (dsp === 'Other' ? formData.dspOther.trim() : dsp))
        .filter(dsp => dsp.length > 0);

      const audiences =
        requestAudiences && requestAudiences.length > 0
          ? requestAudiences
          : [{ id: audience.id, name: audience.name, displayName }];

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
          dsp: selectedDsps.join(', '),
          dsp_platforms: selectedDsps,
          buyer_seat: formData.buyerSeat.trim(),
          campaign_name: formData.campaignName.trim(),
          flight_dates: flightDates,
          flight_start: formData.flightStart,
          flight_end: formData.flightEnd.trim() || null,
          approx_budget: formData.approxBudget.trim() || null,
          ssp_preference: formData.sspPreference,
          preferred_inventory_channel: formData.preferredInventoryChannel.trim() || null,
          notes: formData.notes.trim() || null,
          app_variant: 'index-exchange',
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
    formData.buyerSeat.trim().length > 0 &&
    formData.campaignName.trim().length > 0 &&
    formData.flightStart.trim().length > 0 &&
    formData.dsps.length > 0 &&
    formData.sspPreference.trim().length > 0 &&
    (!formData.dsps.includes('Other') || formData.dspOther.trim().length > 0) &&
    !isSubmitting;

  const isNotebookActivation = (requestAudiences?.length ?? 0) > 1;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-pmg-surface border border-pmg-border rounded-xl shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
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
              <span className="text-pmg-accent text-xl font-bold" aria-hidden="true">
                ✓
              </span>
            </div>
            <h2 className="text-xl font-bold text-pmg-text mb-2">Request Received</h2>
            <p className="text-pmg-muted text-sm mb-6">
              {isNotebookActivation ? (
                'Your deal request for your selected audiences has been submitted. Our team will follow up shortly.'
              ) : (
                <>
                  Your deal request for{' '}
                  <span className="font-medium text-pmg-text">{displayName}</span> has been submitted. Our team will
                  follow up shortly.
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
              <h2 className="text-xl font-bold text-pmg-text">Request a Deal</h2>
            </div>
            <p className="text-pmg-muted text-sm mb-5">{audience.name}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ix-act-name" className={labelClassName}>
                      Name *
                    </label>
                    <input
                      type="text"
                      id="ix-act-name"
                      required
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={inputClassName}
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="ix-act-email" className={labelClassName}>
                      Email *
                    </label>
                    <input
                      type="email"
                      id="ix-act-email"
                      required
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={inputClassName}
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="ix-act-company" className={labelClassName}>
                      Company *
                    </label>
                    <input
                      type="text"
                      id="ix-act-company"
                      required
                      value={formData.company}
                      onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className={inputClassName}
                      placeholder="Acme Media"
                    />
                  </div>

                  <div>
                    <label htmlFor="ix-act-campaign-name" className={labelClassName}>
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      id="ix-act-campaign-name"
                      required
                      value={formData.campaignName}
                      onChange={e => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                      className={inputClassName}
                      placeholder="Q3 Sports Enthusiasts"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ix-act-flight-start" className={labelClassName}>
                        Flight Date *
                      </label>
                      <input
                        type="date"
                        id="ix-act-flight-start"
                        required
                        value={formData.flightStart}
                        onChange={e => setFormData(prev => ({ ...prev, flightStart: e.target.value }))}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="ix-act-flight-end" className={labelClassName}>
                        Flight End{' '}
                        <span className="text-pmg-muted normal-case font-normal">(optional)</span>
                      </label>
                      <input
                        type="date"
                        id="ix-act-flight-end"
                        value={formData.flightEnd}
                        min={formData.flightStart || undefined}
                        onChange={e => setFormData(prev => ({ ...prev, flightEnd: e.target.value }))}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClassName}>DSP or Platform *</label>
                    <DspDropdown
                      id="ix-act-dsp"
                      value=""
                      values={formData.dsps}
                      options={DSP_OPTIONS}
                      placeholder="Select one or more DSPs"
                      onMultiChange={nextValues =>
                        setFormData(prev => ({
                          ...prev,
                          dsps: nextValues as DspOption[],
                          dspOther: nextValues.includes('Other') ? prev.dspOther : '',
                        }))
                      }
                      multiple
                    />
                  </div>

                  {formData.dsps.includes('Other') && (
                    <div>
                      <label htmlFor="ix-act-dsp-other" className={labelClassName}>
                        Please specify DSP *
                      </label>
                      <input
                        type="text"
                        id="ix-act-dsp-other"
                        required
                        value={formData.dspOther}
                        onChange={e => setFormData(prev => ({ ...prev, dspOther: e.target.value }))}
                        className={inputClassName}
                        placeholder="Enter DSP name"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="ix-act-buyer-seat" className={labelClassName}>
                      Buyer Seat *
                    </label>
                    <input
                      type="text"
                      id="ix-act-buyer-seat"
                      required
                      value={formData.buyerSeat}
                      onChange={e => setFormData(prev => ({ ...prev, buyerSeat: e.target.value }))}
                      className={inputClassName}
                      placeholder="Enter buyer seat ID"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>SSP Preference *</label>
                    <DspDropdown
                      id="ix-act-ssp"
                      value={formData.sspPreference}
                      options={SSP_OPTIONS}
                      placeholder="Select SSP preference"
                      onChange={value => setFormData(prev => ({ ...prev, sspPreference: value }))}
                    />
                  </div>

                  <div>
                    <label htmlFor="ix-act-approx-budget" className={labelClassName}>
                      Approx Budget{' '}
                      <span className="text-pmg-muted normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="ix-act-approx-budget"
                      value={formData.approxBudget}
                      onChange={e => setFormData(prev => ({ ...prev, approxBudget: e.target.value }))}
                      className={inputClassName}
                      placeholder="e.g. $50,000"
                    />
                  </div>

                  <div>
                    <label htmlFor="ix-act-preferred-inventory-channel" className={labelClassName}>
                      Preferred Inventory Channel{' '}
                      <span className="text-pmg-muted normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="ix-act-preferred-inventory-channel"
                      value={formData.preferredInventoryChannel}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, preferredInventoryChannel: e.target.value }))
                      }
                      className={inputClassName}
                      placeholder="Display, Video, CTV, etc."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="ix-act-notes" className={labelClassName}>
                  Notes <span className="text-pmg-muted normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  id="ix-act-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className={`${inputClassName} resize-none`}
                  placeholder="Any additional setup context..."
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

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
                    'Submit Deal Request'
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
