import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { APEX_ALLOWED_EMAIL_DOMAIN, apexConfig } from '../config';
import { useApexGate } from '../ApexGateContext';

export function ApexGatePage() {
  const { login, isUnlocked, isLoading } = useApexGate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isLoading && isUnlocked) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const result = login({ name, email });
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
      <div className="apex-reveal w-full max-w-md overflow-hidden rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-panel)] shadow-[0_16px_48px_rgba(12,18,32,0.12)] backdrop-blur-md">
        <div className="border-b border-[var(--apex-line)] bg-[var(--apex-panel-lift)]/80 px-6 py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={apexConfig.header.primaryLogo.src}
              alt=""
              className="h-8 w-auto brightness-0"
            />
            <div className="h-8 w-px bg-[var(--apex-line-strong)] sm:h-10" />
            <img
              src={apexConfig.header.coBrandLogo?.src}
              alt="Apex Exchange"
              className="h-10 w-auto object-contain sm:h-12"
            />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--apex-text)]">
            Apex seller access
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--apex-text-muted)]">
            Sign in with your @{APEX_ALLOWED_EMAIL_DOMAIN} email to explore the Custom Apex Moment
            Builder.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div>
            <label htmlFor="apex-gate-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
              Name
            </label>
            <input
              id="apex-gate-name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              className="w-full rounded-lg border border-[var(--apex-line-strong)] bg-[var(--apex-panel-lift)] px-3 py-2.5 text-sm text-[var(--apex-text)] outline-none transition focus:border-[var(--apex-accent)] focus:ring-2 focus:ring-[var(--apex-glow)]"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label htmlFor="apex-gate-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
              Work email
            </label>
            <input
              id="apex-gate-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-[var(--apex-line-strong)] bg-[var(--apex-panel-lift)] px-3 py-2.5 text-sm text-[var(--apex-text)] outline-none transition focus:border-[var(--apex-accent)] focus:ring-2 focus:ring-[var(--apex-glow)]"
              placeholder={`you@${APEX_ALLOWED_EMAIL_DOMAIN}`}
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--apex-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--apex-accent-deep)] hover:text-white"
          >
            Enter Moment Builder
          </button>
        </form>
      </div>
    </div>
  );
}
