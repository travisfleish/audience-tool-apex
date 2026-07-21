import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Notebook } from '../../components/Notebook';
import { NflHome } from './pages/NflHome';
import { NflNotebook } from './pages/NflNotebook';
import { Audience } from '../../core/types';
import { NOTEBOOK_ENABLED } from '../../core/featureFlags';
import { nflConfig } from './config';
import { useMediaQuery } from '../../core/hooks/useMediaQuery';
import { useDealBuilderState } from '../../core/hooks/useDealBuilderState';
import type { Deal } from '../../core/dealBuilder';
import type { MomentActivationTarget } from '../../core/moments/types';

function NflAppContent({
  deal,
  dealCount,
  onAddAudience,
  onAddMoment,
  onDealSubmitted,
  onRemoveAudience,
  onRemoveMoment,
}: {
  deal: Deal;
  dealCount: number;
  onAddAudience: (a: Audience) => void;
  onAddMoment: (moment: MomentActivationTarget) => void;
  onDealSubmitted: () => void;
  onRemoveAudience: () => void;
  onRemoveMoment: () => void;
}) {
  const location = useLocation();
  const [isNotebookMinimized, setIsNotebookMinimized] = useState(false);
  const [isNotebookCollapsed, setIsNotebookCollapsed] = useState(false);
  const forceMinimizeNotebook = useMediaQuery('(max-width: 1279px)');
  const isMobileViewport = useMediaQuery('(max-width: 639px)');
  const showNotebookPopup = NOTEBOOK_ENABLED && location.pathname !== '/notebook';
  const effectiveNotebookMinimized = isNotebookMinimized;
  const needsSidebarMargin =
    NOTEBOOK_ENABLED &&
    dealCount > 0 &&
    showNotebookPopup &&
    !effectiveNotebookMinimized &&
    !isNotebookCollapsed &&
    !forceMinimizeNotebook;
  const needsBottomNotebookPadding =
    NOTEBOOK_ENABLED && dealCount > 0 && showNotebookPopup && effectiveNotebookMinimized && isMobileViewport;

  useEffect(() => {
    if (forceMinimizeNotebook) setIsNotebookMinimized(true);
  }, [forceMinimizeNotebook]);

  return (
    <>
      <Header
        branding={nflConfig.header}
        notebookCount={dealCount}
        notebookSidebarOpen={needsSidebarMargin}
      />
      <div
        className={[
          needsSidebarMargin ? 'mr-80 lg:mr-96' : '',
          needsBottomNotebookPadding ? 'pb-24' : '',
          'transition-all duration-300',
        ].join(' ').trim()}
      >
        <Routes>
          <Route path="/gate" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={
              <NflHome
                deal={deal}
                onAddAudienceToDeal={onAddAudience}
                onAddMomentToDeal={onAddMoment}
                copy={nflConfig.copy}
                promoModules={nflConfig.promoModules ?? []}
              />
            }
          />
          <Route
            path="/notebook"
            element={
              NOTEBOOK_ENABLED ? (
                <NflNotebook
                  deal={deal}
                  onDealSubmitted={onDealSubmitted}
                  onRemoveAudience={onRemoveAudience}
                  onRemoveMoment={onRemoveMoment}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
      {showNotebookPopup && (
        <Notebook
          deal={deal}
          onDealSubmitted={onDealSubmitted}
          onRemoveAudience={onRemoveAudience}
          onRemoveMoment={onRemoveMoment}
          isMinimized={effectiveNotebookMinimized}
          onMinimizedChange={setIsNotebookMinimized}
          isCollapsed={isNotebookCollapsed}
          onCollapsedChange={setIsNotebookCollapsed}
        />
      )}
    </>
  );
}

export function NflApp() {
  const { deal, addAudience, addMoment, removeAudience, removeMoment, clearDeal, dealItemCount: dealCount } =
    useDealBuilderState(nflConfig.notebookStorageKey);

  useEffect(() => {
    document.title = nflConfig.appName;
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-pmg-bg overflow-x-hidden">
        <NflAppContent
          deal={deal}
          dealCount={dealCount}
          onAddAudience={addAudience}
          onAddMoment={addMoment}
          onDealSubmitted={clearDeal}
          onRemoveAudience={removeAudience}
          onRemoveMoment={removeMoment}
        />
      </div>
    </HashRouter>
  );
}
