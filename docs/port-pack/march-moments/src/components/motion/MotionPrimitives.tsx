import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  delay?: number;
  id?: string;
  once?: boolean;
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
  staggerChildren?: number;
  delayChildren?: number;
  id?: string;
  once?: boolean;
};

export function useReducedMotionSafe() {
  return Boolean(useReducedMotion());
}

const revealBase = {
  initial: { opacity: 0, y: 14 },
  viewport: { once: true, amount: 0.2 }
} as const;

export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  id,
  once = true
}: RevealProps) {
  const reducedMotion = useReducedMotionSafe();
  const Comp = as === "section" ? motion.section : as === "article" ? motion.article : motion.div;
  const initialY = reducedMotion ? 0 : revealBase.initial.y;

  return (
    <Comp
      id={id}
      className={className}
      initial={{ opacity: revealBase.initial.opacity, y: initialY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...revealBase.viewport, once }}
      transition={{
        duration: reducedMotion ? 0.25 : 0.5,
        ease: "easeOut",
        delay
      }}
    >
      {children}
    </Comp>
  );
}

export function Stagger({
  children,
  className,
  as = "div",
  staggerChildren = 0.08,
  delayChildren = 0,
  id,
  once = true
}: StaggerProps) {
  const reducedMotion = useReducedMotionSafe();
  const Comp = as === "ul" ? motion.ul : motion.div;

  return (
    <Comp
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: reducedMotion ? 0 : 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reducedMotion ? 0.25 : 0.5,
            ease: "easeOut",
            staggerChildren: reducedMotion ? 0 : staggerChildren,
            delayChildren
          }
        }
      }}
    >
      {children}
    </Comp>
  );
}
