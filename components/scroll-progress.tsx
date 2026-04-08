"use client";

import { useEffect, useRef } from "react";

/**
 * Global scroll progress bar — thin 2px accent line at the very top of the viewport.
 * Uses transform: scaleX for GPU-accelerated rendering.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    function update() {
      const el = barRef.current;
      if (!el) return;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? Math.min(1, window.scrollY / docH) : 0;
      el.style.transform = `scaleX(${progress})`;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[60] h-[2px] w-full">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
