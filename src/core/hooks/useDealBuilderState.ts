import { useCallback, useEffect, useState } from 'react';
import type { Audience } from '../types';
import type { MomentActivationTarget } from '../moments/types';
import {
  dealItemCount,
  EMPTY_DEAL,
  isDealEmpty,
  parseStoredDeal,
  type Deal,
} from '../dealBuilder';

export function useDealBuilderState(storageKey: string) {
  const [deal, setDeal] = useState<Deal>(EMPTY_DEAL);

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      setDeal(parseStoredDeal(saved));
    }
  }, [storageKey]);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(deal));
  }, [deal, storageKey]);

  const addAudience = useCallback((audience: Audience) => {
    setDeal((current) => {
      if (current.audience) return current;
      return { ...current, audience };
    });
  }, []);

  const addMoment = useCallback((moment: MomentActivationTarget) => {
    setDeal((current) => {
      if (current.moment) return current;
      return { ...current, moment };
    });
  }, []);

  const removeAudience = useCallback(() => {
    setDeal((current) => ({ ...current, audience: null }));
  }, []);

  const removeMoment = useCallback(() => {
    setDeal((current) => ({ ...current, moment: null }));
  }, []);

  const clearDeal = useCallback(() => {
    setDeal(EMPTY_DEAL);
  }, []);

  return {
    deal,
    addAudience,
    addMoment,
    removeAudience,
    removeMoment,
    clearDeal,
    dealItemCount: dealItemCount(deal),
    hasDeal: !isDealEmpty(deal),
  };
}
