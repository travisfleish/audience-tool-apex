import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

interface TeamSlot {
  seed: number;
  name: string;
  logo: string;
}

const CARD_WIDTH = 236;
const CARD_HEIGHT = 92; // Total card height
const ROW_HEIGHT = 46; // Each team row height (CARD_HEIGHT / 2)
const VERTICAL_GAP = 80; // Gap between first-round matchups
const CONNECTOR_GAP = 32; // Horizontal gap for connector lines
const STROKE_WIDTH = 2.6;
const CONNECTOR_BASE_STROKE = "#d4c089";
const CONNECTOR_ACCENT_STROKE = "#eab308";
const vcuLogo = "/team_logos/VCU_Rams_logo.svg.png";
const georgetownLogo = "/team_logos/Georgetown_Hoyas_logo.svg.png";
const purdueLogo = "/team_logos/Purdue-Boilermakers-Logo.png";
const saintPetersLogo = "/team_logos/Saint-Peters-Peacocks-logo.png";
const ANIMATION_TIMINGS_MS = {
  state1: 1100,
  state2: 2200,
  state3: 3200,
  // Fire completion after the Sweet 16 micro-animations finish.
  complete: 5100
} as const;

const HEADER_OFFSET = 48; // tweak 46–52 if font rendering differs
const CONFETTI_PARTICLES = [
  { startX: -12, startY: -58, endX: -42, endY: -8, rotate: -34, color: "#1d4ed8", delay: 0.0, width: 3, height: 8 },
  { startX: -10, startY: -54, endX: -36, endY: -3, rotate: 26, color: "#eab308", delay: 0.02, width: 2, height: 7 },
  { startX: -7, startY: -56, endX: -30, endY: 2, rotate: -22, color: "#3b82f6", delay: 0.04, width: 2, height: 6 },
  { startX: -4, startY: -60, endX: -24, endY: 5, rotate: 18, color: "#f59e0b", delay: 0.06, width: 2, height: 7 },
  { startX: -1, startY: -54, endX: -18, endY: 1, rotate: -16, color: "#1e40af", delay: 0.08, width: 3, height: 8 },
  { startX: 2, startY: -58, endX: -12, endY: 5, rotate: 20, color: "#fde68a", delay: 0.1, width: 2, height: 6 },
  { startX: 5, startY: -52, endX: -6, endY: 0, rotate: -14, color: "#2563eb", delay: 0.12, width: 2, height: 7 },
  { startX: 8, startY: -56, endX: 0, endY: 3, rotate: 24, color: "#fbbf24", delay: 0.14, width: 3, height: 8 },
  { startX: -14, startY: -46, endX: 8, endY: 7, rotate: -18, color: "#3b82f6", delay: 0.16, width: 2, height: 7 },
  { startX: -9, startY: -48, endX: 14, endY: 8, rotate: 22, color: "#f59e0b", delay: 0.18, width: 2, height: 6 },
  { startX: -4, startY: -44, endX: 20, endY: 9, rotate: -20, color: "#1e40af", delay: 0.2, width: 3, height: 8 },
  { startX: 1, startY: -48, endX: 26, endY: 9, rotate: 16, color: "#eab308", delay: 0.22, width: 2, height: 7 },
  { startX: 6, startY: -44, endX: 32, endY: 8, rotate: -24, color: "#93c5fd", delay: 0.24, width: 2, height: 6 },
  { startX: 11, startY: -47, endX: 38, endY: 7, rotate: 20, color: "#d97706", delay: 0.26, width: 3, height: 8 },
  { startX: 16, startY: -42, endX: 44, endY: 6, rotate: -18, color: "#3b82f6", delay: 0.28, width: 2, height: 7 },
  { startX: 20, startY: -46, endX: 50, endY: 5, rotate: 14, color: "#fcd34d", delay: 0.3, width: 2, height: 6 }
] as const;

type MarchMadnessBracketProps = {
  onAnimationComplete?: () => void;
  startAnimation?: boolean;
};

export function MarchMadnessBracket({
  onAnimationComplete,
  startAnimation = true
}: MarchMadnessBracketProps) {
  const [animationState, setAnimationState] = useState(0);

  // Auto-advance animation states
  useEffect(() => {
    if (!startAnimation) {
      setAnimationState(0);
      return;
    }

    setAnimationState(0);
    const timers = [
      window.setTimeout(() => setAnimationState(1), ANIMATION_TIMINGS_MS.state1),
      window.setTimeout(() => setAnimationState(2), ANIMATION_TIMINGS_MS.state2),
      window.setTimeout(() => setAnimationState(3), ANIMATION_TIMINGS_MS.state3),
      window.setTimeout(() => onAnimationComplete?.(), ANIMATION_TIMINGS_MS.complete)
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [onAnimationComplete, startAnimation]);

  // Calculate vertical positions
  const round1Card1Top = 0;
  const round1Card2Top = CARD_HEIGHT + VERTICAL_GAP;

  // Divider line positions (exactly at CARD_HEIGHT / 2 from card top)
  const round1Card1Divider = round1Card1Top + ROW_HEIGHT;
  const round1Card2Divider = round1Card2Top + ROW_HEIGHT;

  // Round 2 divider is centered between the two Round 1 dividers
  const round2Divider = (round1Card1Divider + round1Card2Divider) / 2;
  // Optical adjustment: border weight and shadow can make centered cards appear slightly low.
  const ROUND2_OPTICAL_OFFSET_Y = -1;
  const round2CardTop = round2Divider - ROW_HEIGHT + ROUND2_OPTICAL_OFFSET_Y;
  // Optical adjustment: heavier border + drop shadow can make true center look slightly low.
  const SWEET16_OPTICAL_OFFSET_Y = -2;
  const sweet16CardTop = round2Divider - ROW_HEIGHT / 2 + SWEET16_OPTICAL_OFFSET_Y;

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent p-8">
      <div className="relative flex items-start gap-0">
        {/* Round 1 Column */}
        <div className="relative" style={{ width: `${CARD_WIDTH}px` }}>
          <div className="mb-6 flex justify-center">
            <span className="rounded-full border border-slate-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
              Round of 64
            </span>
          </div>

          <div className="relative" style={{ height: `${round1Card2Top + CARD_HEIGHT}px` }}>
            {/* 6 (Georgetown) vs 11 (VCU) matchup */}
            <div
              className="absolute left-0"
              style={{
                top: `${round1Card1Top}px`,
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
              }}
            >
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
                <TeamRow
                  team={{ seed: 6, name: "Georgetown", logo: georgetownLogo }}
                  isLoser={animationState >= 1}
                />
                <div className="h-px bg-gray-300 flex-shrink-0" />
                <TeamRow
                  team={{ seed: 11, name: "VCU", logo: vcuLogo }}
                  isWinner={animationState >= 1}
                  isVCU={true}
                />
              </div>
            </div>

            {/* 3 (Purdue) vs 14 (Saint Peter's) matchup */}
            <div
              className="absolute left-0"
              style={{
                top: `${round1Card2Top}px`,
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
              }}
            >
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
                <TeamRow
                  team={{ seed: 3, name: "Purdue", logo: purdueLogo }}
                  isWinner={animationState >= 2}
                />
                <div className="h-px bg-gray-300 flex-shrink-0" />
                <TeamRow
                  team={{ seed: 14, name: "Saint Peter's", logo: saintPetersLogo }}
                  isLoser={animationState >= 2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Round 1 to Round 2 Connectors */}
        <svg
          width={CONNECTOR_GAP}
          height={round1Card2Top + CARD_HEIGHT}
          className="flex-shrink-0"
          style={{ marginTop: `${HEADER_OFFSET}px` }} // ✅ ONLY CHANGE
        >
          {/* Connector from Georgetown vs VCU divider to Round 2 */}
          <motion.path
            d={`M 0 ${round1Card1Divider} L ${CONNECTOR_GAP / 2} ${round1Card1Divider} L ${CONNECTOR_GAP / 2} ${round2Divider} L ${CONNECTOR_GAP} ${round2Divider}`}
            stroke={CONNECTOR_BASE_STROKE}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: animationState >= 1 ? 1 : 0,
              stroke: animationState >= 2 ? CONNECTOR_ACCENT_STROKE : CONNECTOR_BASE_STROKE,
            }}
            transition={{ duration: 0.52, ease: "easeOut" }}
          />

          {/* Connector from Purdue vs Saint Peter's divider to Round 2 */}
          <motion.path
            d={`M 0 ${round1Card2Divider} L ${CONNECTOR_GAP / 2} ${round1Card2Divider} L ${CONNECTOR_GAP / 2} ${round2Divider} L ${CONNECTOR_GAP} ${round2Divider}`}
            stroke={CONNECTOR_BASE_STROKE}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: animationState >= 2 ? 1 : 0,
              stroke: CONNECTOR_BASE_STROKE,
            }}
            transition={{ duration: 0.52, ease: "easeOut" }}
          />
        </svg>

        {/* Round 2 Column */}
        <div className="relative" style={{ width: `${CARD_WIDTH}px` }}>
          <div className="mb-6 flex justify-center">
            <span className="rounded-full border border-slate-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
              Round of 32
            </span>
          </div>

          <div className="relative" style={{ height: `${round1Card2Top + CARD_HEIGHT}px` }}>
            <AnimatePresence>
              {animationState >= 1 && (
                <motion.div
                  className="absolute left-0"
                  style={{
                    top: `${round2CardTop}px`,
                    width: `${CARD_WIDTH}px`,
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <motion.div
                    className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm flex flex-col"
                    initial={false}
                    animate={{ height: animationState >= 2 ? CARD_HEIGHT : ROW_HEIGHT }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  >
                    <TeamRow
                      team={{ seed: 11, name: "VCU", logo: vcuLogo }}
                      isWinner={animationState >= 3}
                      isVCU={true}
                    />
                    <AnimatePresence>
                      {animationState >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: ROW_HEIGHT + 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                        >
                          <div className="h-px bg-gray-300 flex-shrink-0" />
                          <TeamRow
                            team={{ seed: 3, name: "Purdue", logo: purdueLogo }}
                            isLoser={animationState >= 3}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Round 2 to Sweet 16 Connector - from Round 2 divider */}
        <svg
          width={CONNECTOR_GAP}
          height={round1Card2Top + CARD_HEIGHT}
          className="flex-shrink-0"
          style={{ marginTop: `${HEADER_OFFSET}px` }} // ✅ ONLY CHANGE
        >
          <motion.line
            x1="0"
            y1={round2Divider}
            x2={CONNECTOR_GAP}
            y2={round2Divider}
            stroke={CONNECTOR_BASE_STROKE}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="square"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: animationState >= 3 ? 1 : 0,
              stroke: animationState >= 3 ? CONNECTOR_ACCENT_STROKE : CONNECTOR_BASE_STROKE,
            }}
            transition={{ duration: 0.58, ease: "easeOut" }}
          />
        </svg>

        {/* Sweet 16 Column */}
        <div className="relative" style={{ width: `${CARD_WIDTH}px` }}>
          <div className="mb-6 flex justify-center">
            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Sweet 16
            </span>
          </div>

          <div className="relative" style={{ height: `${round1Card2Top + CARD_HEIGHT}px` }}>
            <AnimatePresence>
              {animationState >= 3 && (
                <motion.div
                  className="absolute left-0"
                  style={{
                    top: `${sweet16CardTop}px`,
                    width: `${CARD_WIDTH}px`,
                    height: `${ROW_HEIGHT}px`,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -42, scale: 0.84 }}
                    animate={{
                      opacity: [0, 1, 1, 1, 1, 1],
                      y: [-42, 10, -9, 5, -2, 0],
                      scale: [0.84, 1.12, 0.95, 1.05, 0.99, 1],
                      boxShadow: [
                        "0 0 0 rgba(16,185,129,0)",
                        "0 12px 24px rgba(16,185,129,0.3)",
                        "0 7px 16px rgba(16,185,129,0.2)",
                        "0 8px 18px rgba(16,185,129,0.22)",
                        "0 5px 12px rgba(16,185,129,0.16)",
                        "0 4px 10px rgba(16,185,129,0.14)"
                      ]
                    }}
                    transition={{
                      duration: 1.35,
                      ease: "easeOut",
                      delay: 0.26,
                      times: [0, 0.3, 0.5, 0.68, 0.84, 1]
                    }}
                    className="pointer-events-none absolute -top-9 inset-x-0 mx-auto inline-flex w-max items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700"
                  >
                    <span className="pointer-events-none absolute left-1/2 -top-1" aria-hidden="true">
                      {CONFETTI_PARTICLES.map((particle, index) => (
                        <motion.span
                          key={`${particle.color}-${index}`}
                          className="absolute rounded-sm"
                          style={{
                            backgroundColor: particle.color,
                            width: `${particle.width}px`,
                            height: `${particle.height}px`
                          }}
                          initial={{
                            x: particle.startX,
                            y: particle.startY,
                            opacity: 0,
                            rotate: 0,
                            scale: 0.65
                          }}
                          animate={{
                            x: [particle.startX, particle.endX],
                            y: [particle.startY, particle.endY],
                            opacity: [0, 1, 1, 0],
                            rotate: [0, particle.rotate],
                            scale: [0.65, 1, 0.9]
                          }}
                          transition={{
                            duration: 1.05,
                            ease: "easeInOut",
                            delay: 0.44 + particle.delay,
                            times: [0, 0.2, 0.78, 1]
                          }}
                        />
                      ))}
                    </span>
                    <img
                      src="/genius-assets/genius_g_logo.svg"
                      alt=""
                      aria-hidden="true"
                      className="h-5 w-5 opacity-90"
                    />
                    <span>Cinderella Run</span>
                  </motion.div>
                  <div className="bg-white border-2 border-green-500 rounded-lg overflow-hidden shadow-[0_10px_24px_rgba(16,185,129,0.22)] h-full">
                    <div className="flex items-center justify-center gap-3 px-4 h-full bg-green-50">
                      <div className="text-base text-gray-600 min-w-6 flex-shrink-0">11</div>

                      <motion.div
                        className="relative w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={vcuLogo}
                          alt="VCU"
                          className="w-full h-full object-contain p-0.5"
                        />
                      </motion.div>

                      <div className="text-base text-gray-800 flex-shrink-0">VCU</div>

                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                        className="ml-auto w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TeamRowProps {
  team: TeamSlot;
  isWinner?: boolean;
  isLoser?: boolean;
  isVCU?: boolean;
  showPulse?: boolean;
}

function TeamRow({ team, isWinner, isLoser, isVCU, showPulse }: TeamRowProps) {
  return (
    <motion.div
      className={`flex items-center justify-start gap-3 px-4 flex-1 ${
        isWinner ? "bg-green-50" : ""
      }`}
      style={{ minHeight: `${ROW_HEIGHT}px` }}
      animate={{
        opacity: isLoser ? 0.4 : 1,
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="text-base text-gray-500 min-w-6 flex-shrink-0">
        {team.seed}
      </div>

      <motion.div
        className={`relative w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 ${
          isVCU ? "border-2 border-yellow-400" : "border border-gray-300"
        }`}
        animate={{
          scale: showPulse ? [1, 1.15, 1] : 1,
          boxShadow: showPulse
            ? [
                "0 0 0 0 rgba(234, 179, 8, 0)",
                "0 0 0 8px rgba(234, 179, 8, 0.25)",
                "0 0 0 0 rgba(234, 179, 8, 0)",
              ]
            : "0 0 0 0 rgba(234, 179, 8, 0)",
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
          repeat: showPulse ? 2 : 0,
          repeatDelay: 0.2,
        }}
      >
        <img
          src={team.logo}
          alt={team.name}
          className="w-full h-full object-contain p-0.5"
        />
      </motion.div>

      <div className="text-sm text-gray-800 leading-tight flex-1">{team.name}</div>

      {isWinner && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
        >
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
