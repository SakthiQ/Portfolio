"use client";

import { useEffect, useRef } from "react";

// A soft green glow that follows the pointer. Off for touch and reduced motion.
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!fine || reduce || !el) return;
    el.style.opacity = "1";
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.background = `radial-gradient(500px circle at ${e.clientX}px ${e.clientY}px, rgb(74 222 128 / 0.06), transparent 60%)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity" />;
}
