import { useCallback, useEffect, useState } from 'react';
import type { MomentActivationTarget } from '../../core/moments/types';
import {
  apexDealItemCount,
  EMPTY_APEX_DEAL,
  isApexDealEmpty,
  parseStoredApexDeal,
  type ApexDeal,
} from './apexDeal';
import type { ApexSport } from './sportsCatalog';
import type { ApexSubVertical, ApexVertical } from './verticalsCatalog';

export function useApexDealState(storageKey: string) {
  const [deal, setDeal] = useState<ApexDeal>(EMPTY_APEX_DEAL);

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) setDeal(parseStoredApexDeal(saved));
  }, [storageKey]);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(deal));
  }, [deal, storageKey]);

  const setSport = useCallback((sport: ApexSport) => {
    setDeal(current => {
      const sportChanged = current.sport?.slug !== sport.slug;
      if (!sportChanged) return current;
      return {
        ...current,
        sport,
        // Moments are sport-scoped — clear when sport changes.
        moments: [],
      };
    });
  }, []);

  const clearSport = useCallback(() => {
    setDeal(current => ({
      ...current,
      sport: null,
      moments: [],
    }));
  }, []);

  const setVertical = useCallback((vertical: ApexVertical) => {
    setDeal(current => {
      if (current.vertical?.id === vertical.id) return current;
      return {
        ...current,
        vertical,
        subVerticals: [],
      };
    });
  }, []);

  const clearVertical = useCallback(() => {
    setDeal(current => ({
      ...current,
      vertical: null,
      subVerticals: [],
    }));
  }, []);

  const toggleSubVertical = useCallback((sub: ApexSubVertical) => {
    setDeal(current => {
      const exists = current.subVerticals.some(item => item.id === sub.id);
      if (exists) {
        return {
          ...current,
          subVerticals: current.subVerticals.filter(item => item.id !== sub.id),
        };
      }
      return {
        ...current,
        subVerticals: [...current.subVerticals, sub],
      };
    });
  }, []);

  const toggleMoment = useCallback((moment: MomentActivationTarget) => {
    setDeal(current => {
      const exists = current.moments.some(item => item.id === moment.id);
      if (exists) {
        return {
          ...current,
          moments: current.moments.filter(item => item.id !== moment.id),
        };
      }
      return {
        ...current,
        moments: [...current.moments, moment],
      };
    });
  }, []);

  const removeMoment = useCallback((momentId: string) => {
    setDeal(current => ({
      ...current,
      moments: current.moments.filter(item => item.id !== momentId),
    }));
  }, []);

  const clearDeal = useCallback(() => {
    setDeal(EMPTY_APEX_DEAL);
  }, []);

  return {
    deal,
    setSport,
    clearSport,
    setVertical,
    clearVertical,
    toggleSubVertical,
    toggleMoment,
    removeMoment,
    clearDeal,
    dealItemCount: apexDealItemCount(deal),
    hasDeal: !isApexDealEmpty(deal),
  };
}
