import { useEffect, useState, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useMediaQuery } from '../../core/hooks/useMediaQuery';
import { ApexGateProvider, useApexGate } from './ApexGateContext';
import { ApexHeader } from './components/ApexHeader';
import { ApexMomentBuilder } from './components/ApexMomentBuilder';
import { apexConfig } from './config';
import { ApexBuilderPage } from './pages/ApexBuilderPage';
import { ApexGatePage } from './pages/ApexGatePage';
import { ApexHome } from './pages/ApexHome';
import { useApexDealState } from './useApexDealState';

function ApexProtected({ children }: { children: ReactNode }) {
  const { isLoading, isUnlocked } = useApexGate();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--apex-text-muted)]">
        Loading…
      </div>
    );
  }
  if (!isUnlocked) return <Navigate to="/gate" replace />;
  return <>{children}</>;
}

function ApexAppContent() {
  const location = useLocation();
  const {
    deal,
    setSport,
    clearSport,
    setVertical,
    clearVertical,
    toggleSubVertical,
    toggleMoment,
    addCustomMoment,
    removeMoment,
    clearDeal,
    dealItemCount,
  } = useApexDealState(apexConfig.notebookStorageKey);

  const [isNotebookMinimized, setIsNotebookMinimized] = useState(false);
  const [isNotebookCollapsed, setIsNotebookCollapsed] = useState(false);
  const forceMinimizeNotebook = useMediaQuery('(max-width: 1279px)');
  const isMobileViewport = useMediaQuery('(max-width: 639px)');
  const showBuilderPopup = location.pathname !== '/builder' && location.pathname !== '/gate';
  const needsSidebarMargin =
    dealItemCount > 0 &&
    showBuilderPopup &&
    !isNotebookMinimized &&
    !isNotebookCollapsed &&
    !forceMinimizeNotebook;
  const needsBottomPadding =
    dealItemCount > 0 && showBuilderPopup && isNotebookMinimized && isMobileViewport;

  useEffect(() => {
    if (forceMinimizeNotebook) setIsNotebookMinimized(true);
  }, [forceMinimizeNotebook]);

  return (
    <>
      {location.pathname !== '/gate' ? (
        <ApexHeader builderCount={dealItemCount} builderSidebarOpen={needsSidebarMargin} />
      ) : null}
      <div
        className={[
          needsSidebarMargin ? 'mr-80 lg:mr-96' : '',
          needsBottomPadding ? 'pb-28' : '',
          'transition-all duration-300',
        ]
          .join(' ')
          .trim()}
      >
        <Routes>
          <Route path="/gate" element={<ApexGatePage />} />
          <Route
            path="/"
            element={
              <ApexProtected>
                <ApexHome
                  deal={deal}
                  copy={apexConfig.copy}
                  onSelectSport={setSport}
                  onSelectVertical={setVertical}
                  onToggleSubVertical={toggleSubVertical}
                  onToggleMoment={toggleMoment}
                  onAddCustomMoment={addCustomMoment}
                  onRemoveMoment={removeMoment}
                />
              </ApexProtected>
            }
          />
          <Route
            path="/builder"
            element={
              <ApexProtected>
                <ApexBuilderPage
                  deal={deal}
                  onClearSport={clearSport}
                  onClearVertical={clearVertical}
                  onRemoveMoment={removeMoment}
                  onDealSubmitted={clearDeal}
                />
              </ApexProtected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showBuilderPopup ? (
        <ApexMomentBuilder
          deal={deal}
          onClearSport={clearSport}
          onClearVertical={clearVertical}
          onRemoveMoment={removeMoment}
          onDealSubmitted={clearDeal}
          isMinimized={isNotebookMinimized}
          onMinimizedChange={setIsNotebookMinimized}
          isCollapsed={isNotebookCollapsed}
          onCollapsedChange={setIsNotebookCollapsed}
        />
      ) : null}
    </>
  );
}

export function ApexApp() {
  return (
    <ApexGateProvider>
      <HashRouter>
        <div className="apex-app relative">
          <div className="apex-grain" aria-hidden />
          <ApexAppContent />
        </div>
      </HashRouter>
    </ApexGateProvider>
  );
}
