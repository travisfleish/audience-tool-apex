import { motion } from "framer-motion";
import { Reveal, Stagger, useReducedMotionSafe } from "../motion/MotionPrimitives";
import GeniusStripeRail from "../ui/GeniusStripeRail";

type AudiencesSectionProps = {
  header: string;
  subtitle?: string;
  leftHeader?: string;
  leftList: string[];
  rightHeader: string;
  rightList: string[];
};

function AudiencesSection({
  header,
  subtitle,
  leftHeader,
  leftList,
  rightHeader,
  rightList
}: AudiencesSectionProps) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <Reveal id="audiences" as="section" className="scroll-mt-24">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gs-surface p-6 shadow-[0_8px_28px_rgba(15,23,42,0.08)] md:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gs-surface via-gs-surface to-transparent" />
          <GeniusStripeRail
            theme="green"
            className="absolute bottom-0 right-0 top-28 hidden w-[33%] md:block"
            dimmed
          />
        </div>
        <div className="relative z-10">
          <h2 className="section-title">{header}</h2>
          {subtitle ? <p className="mt-4 max-w-2xl text-lg text-slate-600">{subtitle}</p> : null}
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              {leftHeader ? (
                <h3 className="mb-3 text-lg font-semibold text-slate-900">{leftHeader}</h3>
              ) : null}
              <Stagger as="ul" className="space-y-2" staggerChildren={0.06}>
                {leftList.map((item) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-3 text-slate-700"
                    variants={{
                      hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
                      show: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: reducedMotion ? 0.18 : 0.3, ease: "easeOut" }}
                  >
                    <span className="mt-1.5 block h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </Stagger>
            </div>
            <div className="p-0 md:rounded-xl md:border md:border-slate-200 md:bg-gs-surface md:p-6">
              <h3 className="text-lg font-semibold text-slate-900">{rightHeader}</h3>
              <Stagger as="ul" className="mt-4 space-y-3" staggerChildren={0.06}>
                {rightList.map((item) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-3 text-slate-700"
                    variants={{
                      hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
                      show: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: reducedMotion ? 0.18 : 0.3, ease: "easeOut" }}
                  >
                    <span className="mt-1.5 block h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default AudiencesSection;
