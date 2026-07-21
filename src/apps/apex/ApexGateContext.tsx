import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { APEX_ALLOWED_EMAIL_DOMAIN } from './config';

const STORAGE_KEY = 'apex_gate_session';
const SESSION_TTL_DAYS = Number(import.meta.env.VITE_GATE_SESSION_TTL_DAYS ?? 14);

export type ApexGateSession = {
  name: string;
  email: string;
  unlockedAt: number;
};

type ApexGateContextValue = {
  isLoading: boolean;
  isUnlocked: boolean;
  session: ApexGateSession | null;
  login: (input: { name: string; email: string }) => { ok: true } | { ok: false; error: string };
  logout: () => void;
};

const ApexGateContext = createContext<ApexGateContextValue | null>(null);

function isValidApexEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at < 1) return false;
  return normalized.slice(at + 1) === APEX_ALLOWED_EMAIL_DOMAIN;
}

function readSession(): ApexGateSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ApexGateSession;
    if (!parsed?.email || !parsed?.name || !parsed?.unlockedAt) return null;
    const ageMs = Date.now() - parsed.unlockedAt;
    const ttlMs = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
    if (ageMs > ttlMs) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (!isValidApexEmail(parsed.email)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function ApexGateProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<ApexGateSession | null>(null);

  useEffect(() => {
    setSession(readSession());
    setIsLoading(false);
  }, []);

  const login = useCallback((input: { name: string; email: string }) => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name) return { ok: false as const, error: 'Enter your name.' };
    if (!isValidApexEmail(email)) {
      return {
        ok: false as const,
        error: `Use your @${APEX_ALLOWED_EMAIL_DOMAIN} email to continue.`,
      };
    }
    const next: ApexGateSession = { name, email, unlockedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo<ApexGateContextValue>(
    () => ({
      isLoading,
      isUnlocked: Boolean(session),
      session,
      login,
      logout,
    }),
    [isLoading, session, login, logout],
  );

  return <ApexGateContext.Provider value={value}>{children}</ApexGateContext.Provider>;
}

export function useApexGate() {
  const ctx = useContext(ApexGateContext);
  if (!ctx) throw new Error('useApexGate must be used within ApexGateProvider');
  return ctx;
}
