import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import {
  CONTEXT_PACKAGES,
  EMOTION_PACKAGES,
  getPackageDescriptionForSport,
  getPackageItemsForSport,
  getSportLabel,
  MINDSET_PACKAGES,
  MOMENT_SPORTS,
} from '../core/moments/momentsCatalog';
import type { MindsetMomentPackage, MomentActivationTarget, MomentCategory, ThemedMomentPackage } from '../core/moments/types';
import { getMomentSportFromAudienceSport } from '../core/audienceSportFilters';
import {
  hasSeenDealBuilderIntro,
  markDealBuilderIntroSeen,
  scrollToAudiencesSection,
} from '../core/dealBuilder';
import { NOTEBOOK_ENABLED } from '../core/featureFlags';
import { RequestMomentActivationModal } from '../apps/pmg/components/RequestMomentActivationModal';
import { BuildDealIntroModal } from './BuildDealIntroModal';
import { BuildDealMomentSportModal } from './BuildDealMomentSportModal';
import {
  AUDIENCE_CARD_CTA_KLARHEIT_CLASS,
} from './ui/HeroCtaPill';

const MOMENT_CARD_CTA_CLASS = `rounded-lg bg-gs-accent-500 px-3 py-2.5 text-white transition-all hover:bg-gs-accent-600 focus:outline-none focus:ring-2 focus:ring-gs-accent-500/50 shadow-sm hover:shadow-md whitespace-nowrap ${AUDIENCE_CARD_CTA_KLARHEIT_CLASS}`;

const MOMENT_CARD_CTA_DISABLED_CLASS = `rounded-lg bg-gs-bg-muted px-3 py-2.5 text-gs-muted cursor-not-allowed whitespace-nowrap ${AUDIENCE_CARD_CTA_KLARHEIT_CLASS}`;

type SportSelectionGuard = (action: (audienceSportSlug: string) => void) => void;

function resolveMomentTargetForSport(
  target: MomentActivationTarget,
  audienceSportSlug: string,
): MomentActivationTarget {
  const momentSportSlug = getMomentSportFromAudienceSport(audienceSportSlug);
  if (!momentSportSlug) return target;
  return { ...target, sportLabel: getSportLabel(momentSportSlug) };
}

type MomentPackageActionsProps = {
  target: MomentActivationTarget;
  isInDeal: boolean;
  dealMomentSlotTaken: boolean;
  onBuildDeal?: (target: MomentActivationTarget) => void;
  onActivate: (target: MomentActivationTarget) => void;
  guardSportSelection?: SportSelectionGuard;
};

function MomentPackageActions({
  target,
  isInDeal,
  dealMomentSlotTaken,
  onBuildDeal,
  onActivate,
  guardSportSelection,
}: MomentPackageActionsProps) {
  const buildDealDisabled = isInDeal || (dealMomentSlotTaken && !isInDeal);

  const runWithSportGuard = (action: (resolvedTarget: MomentActivationTarget) => void) => {
    if (guardSportSelection) {
      guardSportSelection((audienceSportSlug) => {
        action(resolveMomentTargetForSport(target, audienceSportSlug));
      });
      return;
    }
    action(target);
  };

  const handleBuildDeal = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (buildDealDisabled || !onBuildDeal) return;
    onBuildDeal(target);
  };

  return (
    <>
      <div className={`flex flex-col sm:flex-row gap-2${NOTEBOOK_ENABLED ? '' : ' sm:justify-stretch'}`}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            runWithSportGuard((resolvedTarget) => onActivate(resolvedTarget));
          }}
          className={`w-full${NOTEBOOK_ENABLED ? ' sm:flex-1' : ''} min-w-0 flex items-center justify-center ${MOMENT_CARD_CTA_CLASS}`}
        >
          Activate
        </button>
        {NOTEBOOK_ENABLED && (
          <button
            type="button"
            onClick={handleBuildDeal}
            disabled={buildDealDisabled}
            className={`w-full sm:flex-1 min-w-0 flex items-center justify-center ${buildDealDisabled ? MOMENT_CARD_CTA_DISABLED_CLASS : MOMENT_CARD_CTA_CLASS} ${isInDeal ? 'gap-2' : ''}`}
          >
            {isInDeal ? (
              <>
                <Check className="h-4 w-4 shrink-0" />
                In Deal Builder
              </>
            ) : (
              'Build a Deal'
            )}
          </button>
        )}
      </div>
    </>
  );
}

const MOMENTS_TOGGLE_BUTTON_CLASS = `px-4 py-2 max-md:px-2 max-md:py-2.5 max-md:text-xs max-md:min-h-[44px] transition-colors ${AUDIENCE_CARD_CTA_KLARHEIT_CLASS}`;

const GENIUS_MOMENTS_SUBHEAD =
  'Deal packages that activate dynamically to reach specific fans when the moment or mindset is right.';

const CATEGORY_TABS: { id: MomentCategory; label: string }[] = [
  { id: 'mindset', label: 'Mindset' },
  { id: 'emotion', label: 'Emotion' },
  { id: 'context', label: 'Context' },
];

const PACKAGE_ACCORDION_LIST_CLASS =
  'divide-y divide-[#EEEEEE] overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm';

const PACKAGE_ROW_TITLE_CLASS = 'text-moment-step-row-label m-0 text-left';

const PACKAGE_ROW_DESCRIPTION_CLASS = 'mt-1 text-base leading-relaxed text-slate-600';

function PackageToggleIcon({ expanded }: { expanded: boolean }) {
  return (
    <span className="block h-6 w-6 shrink-0">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="24" height="24" rx="12" fill="currentColor" className="text-lightGreen" />
        {expanded ? (
          <path
            d="M17.0859 12.0264L6.96702 12.0264"
            stroke="currentColor"
            className="text-white"
            strokeWidth="1.08"
            strokeLinecap="round"
          />
        ) : (
          <>
            <path
              d="M12.0264 6.96777V17.0867"
              stroke="currentColor"
              className="text-white"
              strokeWidth="1.08"
              strokeLinecap="round"
            />
            <path
              d="M17.0859 12.0264L6.96702 12.0264"
              stroke="currentColor"
              className="text-white"
              strokeWidth="1.08"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </span>
  );
}

type PackageSignalListProps = {
  signals: ReturnType<typeof getPackageItemsForSport>;
};

function PackageSignalList({ signals }: PackageSignalListProps) {
  const midpoint = Math.ceil(signals.length / 2);
  const leftSignals = signals.slice(0, midpoint);
  const rightSignals = signals.slice(midpoint);

  const listClass = 'list-disc flex-1 space-y-1.5 pl-5';

  return (
    <div className="flex flex-col gap-y-1.5 sm:flex-row sm:gap-x-8">
      <ul className={listClass}>
        {leftSignals.map(signal => (
          <li key={signal.id}>{signal.name}</li>
        ))}
      </ul>
      {rightSignals.length > 0 ? (
        <ul className={listClass}>
          {rightSignals.map(signal => (
            <li key={signal.id}>{signal.name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type PackageAccordionItemProps = {
  pkg: ThemedMomentPackage;
  sportSlug: string;
  isExpanded: boolean;
  onTogglePackage: (packageId: string) => void;
  onActivate: (target: MomentActivationTarget) => void;
  dealMomentId?: string | null;
  dealMomentSlotTaken: boolean;
  onBuildDeal?: (target: MomentActivationTarget) => void;
  guardSportSelection?: SportSelectionGuard;
};

function PackageAccordionItem({
  pkg,
  sportSlug,
  isExpanded,
  onTogglePackage,
  onActivate,
  dealMomentId,
  dealMomentSlotTaken,
  onBuildDeal,
  guardSportSelection,
}: PackageAccordionItemProps) {
  const signals = getPackageItemsForSport(pkg, sportSlug);
  const description = getPackageDescriptionForSport(pkg, sportSlug);
  const activationTarget: MomentActivationTarget = {
    id: pkg.id,
    name: pkg.name,
    category: pkg.category,
    sportLabel: getSportLabel(sportSlug),
    packageName: pkg.name,
  };

  return (
    <div className="px-5 py-5 max-md:px-4 max-md:py-4">
      <button
        type="button"
        onClick={() => onTogglePackage(pkg.id)}
        className="flex w-full flex-col bg-transparent text-left text-black transition-colors hover:bg-neutral-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-accent-500 focus-visible:ring-inset"
        aria-expanded={isExpanded}
        aria-controls={`moment-package-${pkg.id}`}
      >
        <div className="flex gap-3">
          <PackageToggleIcon expanded={isExpanded} />
          <div className="min-w-0 max-md:hidden">
            <h3 className={PACKAGE_ROW_TITLE_CLASS}>{pkg.name}</h3>
            {description ? (
              <p className={PACKAGE_ROW_DESCRIPTION_CLASS}>{description}</p>
            ) : null}
          </div>
          <h3 className={`${PACKAGE_ROW_TITLE_CLASS} md:hidden`}>{pkg.name}</h3>
        </div>
        {description ? (
          <p className={`${PACKAGE_ROW_DESCRIPTION_CLASS} mt-2 text-center md:hidden`}>{description}</p>
        ) : null}
      </button>

      <div className="mt-4 pl-9 max-md:flex max-md:flex-col max-md:items-center max-md:pl-0">
        <div className="w-full max-w-xs md:max-w-none">
          <MomentPackageActions
            target={activationTarget}
            isInDeal={dealMomentId === pkg.id}
            dealMomentSlotTaken={dealMomentSlotTaken}
            onBuildDeal={onBuildDeal}
            onActivate={onActivate}
            guardSportSelection={guardSportSelection}
          />
        </div>
      </div>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div id={`moment-package-${pkg.id}`} className="pt-4 pl-9 text-base leading-relaxed text-slate-600">
            {!description ? <p className="mb-3 text-slate-600">{pkg.subtitle}</p> : null}
            {signals.length > 0 ? (
              <PackageSignalList signals={signals} />
            ) : (
              <p className="text-slate-500">No signals listed for this sport yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type ThemedPackageAccordionProps = {
  packages: ThemedMomentPackage[];
  sportSlug: string;
  expandedPackageId: string | null;
  onTogglePackage: (packageId: string) => void;
  onActivate: (target: MomentActivationTarget) => void;
  mobileOptimized?: boolean;
  dealMomentId?: string | null;
  dealMomentSlotTaken: boolean;
  onBuildDeal?: (target: MomentActivationTarget) => void;
  guardSportSelection?: SportSelectionGuard;
};

function ThemedPackageAccordion({
  packages,
  sportSlug,
  expandedPackageId,
  onTogglePackage,
  onActivate,
  mobileOptimized = false,
  dealMomentId,
  dealMomentSlotTaken,
  onBuildDeal,
  guardSportSelection,
}: ThemedPackageAccordionProps) {
  const midpoint = Math.ceil(packages.length / 2);
  const packageColumns = [packages.slice(0, midpoint), packages.slice(midpoint)];

  const columnGridClass = mobileOptimized
    ? 'grid items-start gap-4 sm:grid-cols-2 sm:gap-6'
    : 'grid items-start gap-6 md:grid-cols-2';

  return (
    <div className={columnGridClass}>
      {packageColumns.map((columnPackages, columnIndex) => (
        <div key={`column-${columnIndex}`} className={PACKAGE_ACCORDION_LIST_CLASS}>
          {columnPackages.map(pkg => (
            <PackageAccordionItem
              key={pkg.id}
              pkg={pkg}
              sportSlug={sportSlug}
              isExpanded={expandedPackageId === pkg.id}
              onTogglePackage={onTogglePackage}
              onActivate={onActivate}
              dealMomentId={dealMomentId}
              dealMomentSlotTaken={dealMomentSlotTaken}
              onBuildDeal={onBuildDeal}
              guardSportSelection={guardSportSelection}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

type MindsetPackageIconProps = {
  slug: string;
};

function MindsetPackageIcon({ slug }: MindsetPackageIconProps) {
  const iconConfig = {
    winning_fans: {
      bgClass: 'bg-[#18c971]',
      children: (
        <>
          <path
            d="M7 17L11 13L14.5 15L18 9"
            stroke="#0C1220"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 9H18V11.5"
            stroke="#0C1220"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ),
    },
    losing_fans: {
      bgClass: 'bg-[#F07167]',
      children: (
        <>
          <path
            d="M7 9L11 13L14.5 11L18 17"
            stroke="#0C1220"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 17H18V14.5"
            stroke="#0C1220"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ),
    },
    high_intensity: {
      bgClass: 'bg-[#7EC8E3]',
      children: (
        <path
          d="M5 13H8.5L10 9L12 17L14 11H19"
          stroke="#0C1220"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    low_intensity: {
      bgClass: 'bg-[#9CA3AF]',
      children: (
        <path
          d="M5 13H9.5C10.5 13 11 11.5 12 11.5C13 11.5 13.5 13 14.5 13H19"
          stroke="#0C1220"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
  } as const;

  const config = iconConfig[slug as keyof typeof iconConfig];
  if (!config) return null;

  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.bgClass}`}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {config.children}
      </svg>
    </span>
  );
}

type MindsetCardsProps = {
  packages: MindsetMomentPackage[];
  sportSlug: string;
  onActivate: (target: MomentActivationTarget) => void;
  dealMomentId?: string | null;
  dealMomentSlotTaken: boolean;
  onBuildDeal?: (target: MomentActivationTarget) => void;
  guardSportSelection?: SportSelectionGuard;
};

function MindsetCards({
  packages,
  sportSlug,
  onActivate,
  dealMomentId,
  dealMomentSlotTaken,
  onBuildDeal,
  guardSportSelection,
}: MindsetCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {packages.map(pkg => (
        <article
          key={pkg.id}
          className="flex flex-col rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <MindsetPackageIcon slug={pkg.slug} />
            <h3 className="text-lg font-semibold text-slate-900">{pkg.name}</h3>
          </div>
          <p className="mt-2 flex-1 text-base leading-relaxed text-slate-600">{pkg.description}</p>
          <div className="mt-4">
            <MomentPackageActions
              target={{
                id: pkg.id,
                name: pkg.name,
                category: 'mindset',
                sportLabel: getSportLabel(sportSlug),
                packageName: pkg.name,
              }}
              isInDeal={dealMomentId === pkg.id}
              dealMomentSlotTaken={dealMomentSlotTaken}
              onBuildDeal={onBuildDeal}
              onActivate={onActivate}
              guardSportSelection={guardSportSelection}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

type MomentsComingSoonSectionProps = {
  sportLabel: string;
};

export function MomentsComingSoonSection({ sportLabel }: MomentsComingSoonSectionProps) {
  return (
    <section id="moments" className="page-section-gap scroll-mt-24">
      <div className="mb-10 sm:mb-14 text-center">
        <h2 className="hero-display-title text-gs-primary-900">Genius Moments</h2>
        <p className="mx-auto mt-3 max-w-4xl text-subhead font-normal text-pretty max-md:text-base max-md:leading-relaxed max-md:px-2">{GENIUS_MOMENTS_SUBHEAD}</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-gs-surface max-md:p-6 shadow-[0_8px_28px_rgba(15,23,42,0.08)] sm:p-14">
        <p className="m-0 text-center text-xl font-normal text-slate-900 sm:text-2xl font-heading">
          {sportLabel} Moments Coming Soon
        </p>
      </div>
    </section>
  );
}

type MomentsSectionProps = {
  mobileOptimized?: boolean;
  selectedSport?: string;
  title?: string;
  subtitle?: string;
  onAddMomentToDeal?: (moment: MomentActivationTarget) => void;
  dealMomentId?: string | null;
  dealMomentSlotTaken?: boolean;
  guardSportSelection?: SportSelectionGuard;
  audienceSportSlug?: string | null;
  onAudienceSportSelect?: (sportSlug: string) => void;
};

type BuildDealModalState =
  | { kind: 'sport-and-intro'; target: MomentActivationTarget }
  | { kind: 'intro-only' }
  | null;

export function MomentsSection({
  mobileOptimized = false,
  selectedSport: selectedSportProp,
  title,
  subtitle,
  onAddMomentToDeal,
  dealMomentId = null,
  dealMomentSlotTaken = false,
  guardSportSelection,
  audienceSportSlug = null,
  onAudienceSportSelect,
}: MomentsSectionProps) {
  const [internalSelectedSport] = useState(MOMENT_SPORTS[0]?.slug ?? 'football');
  const selectedSport = selectedSportProp ?? internalSelectedSport;
  const [selectedCategory, setSelectedCategory] = useState<MomentCategory>('mindset');
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
  const [ctaModalOpen, setCtaModalOpen] = useState(false);
  const [activationTarget, setActivationTarget] = useState<MomentActivationTarget | null>(null);
  const [buildDealModal, setBuildDealModal] = useState<BuildDealModalState>(null);
  const [combinedModalSport, setCombinedModalSport] = useState<string | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (selectedSportProp !== undefined) {
      setExpandedPackageId(null);
    }
  }, [selectedSportProp]);

  const themedPackages = useMemo(() => {
    if (selectedCategory === 'emotion') return EMOTION_PACKAGES;
    if (selectedCategory === 'context') return CONTEXT_PACKAGES;
    return [];
  }, [selectedCategory]);

  const togglePackage = useCallback((packageId: string) => {
    setExpandedPackageId(prev => (prev === packageId ? null : packageId));
  }, []);

  const openActivationModal = useCallback((target: MomentActivationTarget) => {
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    setActivationTarget(target);
    setCtaModalOpen(true);
  }, []);

  const closeActivationModal = useCallback(() => {
    setCtaModalOpen(false);
    setActivationTarget(null);
    requestAnimationFrame(() => {
      lastActiveElementRef.current?.focus();
    });
  }, []);

  const handleCategoryChange = useCallback((category: MomentCategory) => {
    setSelectedCategory(category);
    setExpandedPackageId(null);
  }, []);

  const clearBuildDealModal = useCallback(() => {
    setBuildDealModal(null);
    setCombinedModalSport(null);
  }, []);

  const handleIntroContinue = useCallback(() => {
    markDealBuilderIntroSeen();
    clearBuildDealModal();
    scrollToAudiencesSection();
  }, [clearBuildDealModal]);

  const handleIntroClose = useCallback(() => {
    markDealBuilderIntroSeen();
    clearBuildDealModal();
  }, [clearBuildDealModal]);

  const handleCombinedIntroClose = useCallback(() => {
    if (combinedModalSport) {
      markDealBuilderIntroSeen();
    }
    clearBuildDealModal();
  }, [clearBuildDealModal, combinedModalSport]);

  const handleCombinedSportSelect = useCallback(
    (sportSlug: string) => {
      const isFirstSportSelection = combinedModalSport === null;
      setCombinedModalSport(sportSlug);
      onAudienceSportSelect?.(sportSlug);

      if (buildDealModal?.kind === 'sport-and-intro' && isFirstSportSelection) {
        onAddMomentToDeal?.(resolveMomentTargetForSport(buildDealModal.target, sportSlug));
      }
    },
    [buildDealModal, combinedModalSport, onAddMomentToDeal, onAudienceSportSelect],
  );

  const handleBuildDeal = useCallback(
    (target: MomentActivationTarget) => {
      if (!onAddMomentToDeal) return;

      const isFirstTime = !hasSeenDealBuilderIntro();
      const needsSport = audienceSportSlug == null && !!guardSportSelection;

      if (needsSport && isFirstTime) {
        setCombinedModalSport(null);
        setBuildDealModal({ kind: 'sport-and-intro', target });
        return;
      }

      const addAndMaybeIntro = (resolvedTarget: MomentActivationTarget) => {
        onAddMomentToDeal(resolvedTarget);
        if (isFirstTime) {
          setBuildDealModal({ kind: 'intro-only' });
        }
      };

      if (needsSport && guardSportSelection) {
        guardSportSelection((sportSlug) => {
          addAndMaybeIntro(resolveMomentTargetForSport(target, sportSlug));
        });
        return;
      }

      addAndMaybeIntro(target);
    },
    [audienceSportSlug, guardSportSelection, onAddMomentToDeal],
  );

  const hasSelectedSport = selectedSportProp !== undefined;
  const momentTypeHeading = hasSelectedSport
    ? `Select your ${getSportLabel(selectedSport)} Moment Type`
    : 'Select your Moment Type';
  const momentsTitle = title ?? 'Genius Moments';
  const momentsSubtitle = subtitle ?? GENIUS_MOMENTS_SUBHEAD;

  return (
    <section id="moments" className="page-section-gap scroll-mt-24">
      <div className="mb-10 sm:mb-14 text-center">
        <h2 className="hero-display-title text-gs-primary-900">{momentsTitle}</h2>
        <p className="mx-auto mt-3 max-w-4xl text-subhead font-normal text-pretty max-md:text-base max-md:leading-relaxed max-md:px-2">{momentsSubtitle}</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-gs-surface p-6 shadow-[0_8px_28px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-full max-w-lg">
            <p className="m-0 text-xl font-normal text-slate-900 sm:text-2xl font-heading">
              {momentTypeHeading}
            </p>
            <div
              className="mt-5 sm:mt-6 flex w-full overflow-hidden rounded-full border border-gs-border"
              role="group"
              aria-label="Moment type"
            >
              {CATEGORY_TABS.map((tab, index) => {
                const isSelected = tab.id === selectedCategory;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleCategoryChange(tab.id)}
                    className={`${MOMENTS_TOGGLE_BUTTON_CLASS} min-w-0 flex-1 ${
                      index > 0 ? 'border-l border-gs-border' : ''
                    } ${
                      isSelected ? 'bg-gs-primary-900 text-white' : 'bg-white text-gs-primary-900 hover:bg-neutral-50'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="mt-8">
          {selectedCategory === 'mindset' ? (
            <MindsetCards
              packages={MINDSET_PACKAGES}
              sportSlug={selectedSport}
              onActivate={openActivationModal}
              dealMomentId={dealMomentId}
              dealMomentSlotTaken={dealMomentSlotTaken}
              onBuildDeal={handleBuildDeal}
              guardSportSelection={guardSportSelection}
            />
          ) : (
            <ThemedPackageAccordion
              packages={themedPackages}
              sportSlug={selectedSport}
              expandedPackageId={expandedPackageId}
              onTogglePackage={togglePackage}
              onActivate={openActivationModal}
              mobileOptimized={mobileOptimized}
              dealMomentId={dealMomentId}
              dealMomentSlotTaken={dealMomentSlotTaken}
              onBuildDeal={handleBuildDeal}
              guardSportSelection={guardSportSelection}
            />
          )}
        </div>
      </div>

      {ctaModalOpen && (
        <RequestMomentActivationModal onClose={closeActivationModal} moment={activationTarget} />
      )}

      {buildDealModal?.kind === 'sport-and-intro' && (
        <BuildDealMomentSportModal
          selectedSport={combinedModalSport}
          onSportSelect={handleCombinedSportSelect}
          onClose={handleCombinedIntroClose}
          onContinue={handleIntroContinue}
        />
      )}

      {buildDealModal?.kind === 'intro-only' && (
        <BuildDealIntroModal
          variant="moment-added"
          onClose={handleIntroClose}
          onContinue={handleIntroContinue}
        />
      )}
    </section>
  );
}
