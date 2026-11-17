"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="mb-10">
      <p className="font-mono text-xs text-accent">
        {index} <span className="text-faint">/</span>
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
    </Reveal>
  );
}
