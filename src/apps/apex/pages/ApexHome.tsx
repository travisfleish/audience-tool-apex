import { useEffect, useRef } from 'react';
import type { AppCopy } from '../../../core/config/appConfig';
import type { ApexDeal } from '../apexDeal';
import type { ApexSport } from '../sportsCatalog';
import type { ApexSubVertical, ApexVertical } from '../verticalsCatalog';
import type { MomentActivationTarget } from '../../../core/moments/types';
import { ApexSportStep } from '../components/ApexSportStep';
import { ApexVerticalStep } from '../components/ApexVerticalStep';
import { ApexMomentsStep } from '../components/ApexMomentsStep';

type ApexHomeProps = {
  deal: ApexDeal;
  copy: AppCopy;
  onSelectSport: (sport: ApexSport) => void;
  onSelectVertical: (vertical: ApexVertical) => void;
  onToggleSubVertical: (sub: ApexSubVertical) => void;
  onToggleMoment: (moment: MomentActivationTarget) => void;
};

export function ApexHome({
  deal,
  copy,
  onSelectSport,
  onSelectVertical,
  onToggleSubVertical,
  onToggleMoment,
}: ApexHomeProps) {
  const verticalUnlocked = Boolean(deal.sport);
  const momentsUnlocked = Boolean(deal.sport && deal.vertical && deal.subVerticals.length > 0);

  const verticalRef = useRef<HTMLDivElement>(null);
  const momentsRef = useRef<HTMLDivElement>(null);
  const prevSport = useRef<string | null>(null);
  const prevSubs = useRef(0);

  useEffect(() => {
    if (deal.sport && deal.sport.slug !== prevSport.current) {
      prevSport.current = deal.sport.slug;
      window.setTimeout(() => {
        verticalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [deal.sport]);

  useEffect(() => {
    if (momentsUnlocked && deal.subVerticals.length > 0 && prevSubs.current === 0) {
      window.setTimeout(() => {
        momentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
    prevSubs.current = deal.subVerticals.length;
  }, [deal.subVerticals.length, momentsUnlocked]);

  const activeStep: 1 | 2 | 3 = !deal.sport ? 1 : !momentsUnlocked ? 2 : 3;

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:pb-24 lg:px-8">
      <section className="apex-reveal mb-10 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--apex-accent)]">
          Genius Sports × Apex
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--apex-text)] sm:text-5xl md:text-6xl">
          {copy.heroTitle}
        </h1>
        {copy.heroSubtitle ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--apex-text-muted)] sm:text-lg">
            {copy.heroSubtitle}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-[var(--apex-text-muted)]">
          <StepChip n={1} label="Sport" active={activeStep === 1} done={Boolean(deal.sport)} />
          <StepChip
            n={2}
            label="Vertical"
            active={activeStep === 2}
            done={Boolean(deal.vertical && deal.subVerticals.length)}
          />
          <StepChip
            n={3}
            label="Moments"
            active={activeStep === 3}
            done={deal.moments.length > 0}
          />
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <div className="apex-reveal apex-reveal-delay-1">
          <ApexSportStep
            selected={deal.sport}
            onSelect={onSelectSport}
            isActive={activeStep === 1}
          />
        </div>

        <div ref={verticalRef} className="apex-reveal apex-reveal-delay-2">
          <ApexVerticalStep
            locked={!verticalUnlocked}
            selectedVertical={deal.vertical}
            selectedSubs={deal.subVerticals}
            onSelectVertical={onSelectVertical}
            onToggleSub={onToggleSubVertical}
            isActive={activeStep === 2}
          />
        </div>

        <div ref={momentsRef} className="apex-reveal apex-reveal-delay-3">
          <ApexMomentsStep
            locked={!momentsUnlocked}
            sport={deal.sport}
            selectedMoments={deal.moments}
            onToggleMoment={onToggleMoment}
            isActive={activeStep === 3}
          />
        </div>
      </div>

      <footer className="mt-14 border-t border-[var(--apex-line)] pt-8">
        <p className="text-base font-medium leading-relaxed text-[var(--apex-text)]">
          Let our team build you a custom solution using your sport, vertical, and moments. Not
          finding what you need? Include it in your RFP notes when you submit.
        </p>
      </footer>
    </main>
  );
}

function StepChip({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
        active
          ? 'border-[var(--apex-accent)] bg-[var(--apex-glow)] text-[var(--apex-accent)]'
          : done
            ? 'border-[var(--apex-line-strong)] text-[var(--apex-text)]'
            : 'border-[var(--apex-line)] text-[var(--apex-text-muted)]',
      ].join(' ')}
    >
      <span className="font-semibold">{n}</span>
      {label}
    </span>
  );
}
