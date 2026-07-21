import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Notebook } from '../../components/Notebook';
import { IndexExchangeHome } from './pages/IndexExchangeHome';
import { PmgNotebook } from '../pmg/pages/PmgNotebook';
import { Audience } from '../../core/types';
import { AUDIENCE_SELECT, toAudiences } from '../../core/audienceVariants';
import { supabase } from '../../core/supabase';
import { NOTEBOOK_ENABLED } from '../../core/featureFlags';
import { indexExchangeConfig } from './config';
import { useMediaQuery } from '../../core/hooks/useMediaQuery';
import { normalizeShoutedDisplayName } from '../../core/audienceDisplay';
import { useDealBuilderState } from '../../core/hooks/useDealBuilderState';
import type { Deal } from '../../core/dealBuilder';
import type { MomentActivationTarget } from '../../core/moments/types';

function IndexExchangeAppContent({
  deal,
  dealCount,
  onAddAudience,
  onAddMoment,
  onDealSubmitted,
  onRemoveAudience,
  onRemoveMoment,
  latestReport,
  handleDownloadAllAudiences,
}: {
  deal: Deal;
  dealCount: number;
  onAddAudience: (a: Audience) => void;
  onAddMoment: (moment: MomentActivationTarget) => void;
  onDealSubmitted: () => void;
  onRemoveAudience: () => void;
  onRemoveMoment: () => void;
  latestReport: any;
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
        branding={indexExchangeConfig.header}
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
              <IndexExchangeHome
                deal={deal}
                onAddAudienceToDeal={onAddAudience}
                onAddMomentToDeal={onAddMoment}
                copy={indexExchangeConfig.copy}
              />
            }
          />
          <Route
            path="/notebook"
            element={
              NOTEBOOK_ENABLED ? (
                <PmgNotebook
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

export function IndexExchangeApp() {
  const { deal, addAudience, addMoment, removeAudience, removeMoment, clearDeal, dealItemCount: dealCount } =
    useDealBuilderState(indexExchangeConfig.notebookStorageKey);
  const [latestReport, setLatestReport] = useState<any>(null);
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
          .select(AUDIENCE_SELECT)
          .order('name')
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Error fetching audiences:', error);
          break;
        }

        if (data) {
          allData = [...allData, ...toAudiences(data)];
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
    link.download = indexExchangeConfig.allAudiencesCsvFilename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-pmg-bg">
        <IndexExchangeAppContent
          deal={deal}
          dealCount={dealCount}
          onAddAudience={addAudience}
          onAddMoment={addMoment}
          onDealSubmitted={clearDeal}
          onRemoveAudience={removeAudience}
          onRemoveMoment={removeMoment}
          latestReport={latestReport}
          handleDownloadAllAudiences={handleDownloadAllAudiences}
        />
      </div>
    </HashRouter>
  );
}
