"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE = 40;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular reading progress ring — bottom-right corner on blog posts.
 * Shows percentage inside, turns green with checkmark at 100%.
 * Click scrolls to top.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const ringRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ticking = false;

    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? Math.min(100, (window.scrollY / docH) * 100) : 0;
      setProgress(p);

      // Direct DOM updates for smooth animation (avoid re-render per frame)
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(
          CIRCUMFERENCE * (1 - p / 100),
        );
      }
      if (textRef.current) {
        textRef.current.textContent = `${Math.round(p)}`;
      }
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

  const complete = progress >= 99.5;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-20 right-6 z-50 flex items-center justify-center rounded-full border border-border bg-card shadow-lg transition-colors hover:border-accent",
        progress < 5 && "opacity-0 pointer-events-none",
        "transition-opacity duration-300",
      )}
      style={{ width: SIZE, height: SIZE }}
      aria-label={complete ? "Back to top" : `Reading progress: ${Math.round(progress)}%`}
    >
      {/* SVG ring */}
      <svg
        width={SIZE}
        height={SIZE}
        className="absolute inset-0 -rotate-90"
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        {/* Progress */}
        <circle
          ref={ringRef}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={complete ? "#22C55E" : "var(--accent)"}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          className="transition-[stroke] duration-300"
        />
      </svg>

      {/* Center content */}
      {complete ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <span
          ref={textRef}
          className="text-[10px] font-medium text-muted-foreground"
          style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
        >
          {Math.round(progress)}
        </span>
      )}
    </button>
  );
}
