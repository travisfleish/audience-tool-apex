import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '../../components/Header';
import { MainHome } from './pages/MainHome';
import { NotebookPage } from '../../pages/NotebookPage';
import { Notebook } from '../../components/Notebook';
import { Audience, Report, supabase } from '../../lib/supabase';
import { NOTEBOOK_ENABLED } from '../../core/featureFlags';
import { mainConfig } from './config';
import { useMediaQuery } from '../../core/hooks/useMediaQuery';
import { normalizeShoutedDisplayName } from '../../core/audienceDisplay';
import { useDealBuilderState } from '../../core/hooks/useDealBuilderState';
import type { Deal } from '../../core/dealBuilder';
import type { MomentActivationTarget } from '../../core/moments/types';

function MainAppContent({
  deal,
  dealCount,
  handleAddAudienceToDeal,
  handleAddMomentToDeal,
  handleDealSubmitted,
  handleRemoveAudience,
  handleRemoveMoment,
  latestReport,
  handleDownloadAllAudiences,
}: {
  deal: Deal;
  dealCount: number;
  handleAddAudienceToDeal: (audience: Audience) => void;
  handleAddMomentToDeal: (moment: MomentActivationTarget) => void;
  handleDealSubmitted: () => void;
  handleRemoveAudience: () => void;
  handleRemoveMoment: () => void;
  latestReport: Report | null;
  handleDownloadAllAudiences: () => void;
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
        branding={mainConfig.header}
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
              <MainHome
                deal={deal}
                onAddAudienceToDeal={handleAddAudienceToDeal}
                onAddMomentToDeal={handleAddMomentToDeal}
                copy={mainConfig.copy}
              />
            }
          />
          <Route
            path="/world-cup"
            element={
              <MainHome
                deal={deal}
                onAddAudienceToDeal={handleAddAudienceToDeal}
                onAddMomentToDeal={handleAddMomentToDeal}
                copy={mainConfig.copy}
                initialSportSlug="world_cup"
              />
            }
          />
          <Route
            path="/notebook"
            element={
              NOTEBOOK_ENABLED ? (
                <NotebookPage
                  deal={deal}
                  onDealSubmitted={handleDealSubmitted}
                  onRemoveAudience={handleRemoveAudience}
                  onRemoveMoment={handleRemoveMoment}
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
          onDealSubmitted={handleDealSubmitted}
          onRemoveAudience={handleRemoveAudience}
          onRemoveMoment={handleRemoveMoment}
          isMinimized={effectiveNotebookMinimized}
          onMinimizedChange={setIsNotebookMinimized}
          isCollapsed={isNotebookCollapsed}
          onCollapsedChange={setIsNotebookCollapsed}
        />
      )}
    </>
  );
}

export function MainApp() {
  const { deal, addAudience, addMoment, removeAudience, removeMoment, clearDeal, dealItemCount: dealCount } =
    useDealBuilderState(mainConfig.notebookStorageKey);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [allAudiences, setAllAudiences] = useState<Audience[]>([]);

  useEffect(() => {
    fetchLatestReport();
    fetchAllAudiences();
  }, []);

  const fetchLatestReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('is_featured', true)
        .order('published_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLatestReport(data);
      }
    } catch (error) {
      console.error('Error fetching latest report:', error);
    }
  };

  const fetchAllAudiences = async () => {
    try {
      let allData: Audience[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('audiences')
          .select('id, name, display_name, description, category, tags, is_featured, sports_league, created_at, updated_at')
          .order('name')
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Error fetching audiences:', error);
          break;
        }

        if (data) {
          allData = [...allData, ...data];
          hasMore = data.length === pageSize;
          from += pageSize;
        } else {
          hasMore = false;
        }
      }

      setAllAudiences(allData);
    } catch (error) {
      console.error('Error fetching all audiences:', error);
    }
  };

  const getDisplayName = (fullName: string) => {
    const parts = fullName.split('>').map(part => part.trim());
    return normalizeShoutedDisplayName(parts[parts.length - 1]);
  };

  const handleDownloadAllAudiences = () => {
    const headers = ['Audience Name', 'Full Path', 'Description', 'Category'];
    const rows = allAudiences.map(a => [
      getDisplayName(a.name),
      a.name,
      a.description,
      a.category
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mainConfig.allAudiencesCsvFilename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gs-bg overflow-x-hidden">
        <MainAppContent
          deal={deal}
          dealCount={dealCount}
          handleAddAudienceToDeal={addAudience}
          handleAddMomentToDeal={addMoment}
          handleDealSubmitted={clearDeal}
          handleRemoveAudience={removeAudience}
          handleRemoveMoment={removeMoment}
          latestReport={latestReport}
          handleDownloadAllAudiences={handleDownloadAllAudiences}
        />
      </div>
    </BrowserRouter>
  );
}
