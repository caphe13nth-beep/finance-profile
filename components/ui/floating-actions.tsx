"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Reading progress ring (blog posts only) ────────

const SIZE = 44;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ReadingRing() {
  const [progress, setProgress] = useState(0);
  const ringRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ticking = false;

    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? Math.min(100, (window.scrollY / docH) * 100) : 0;
      setProgress(p);

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
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: progress > 3 ? 1 : 0, scale: progress > 3 ? 1 : 0.8 }}
      transition={{ duration: 0.2 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "relative flex items-center justify-center rounded-full border border-border bg-card shadow-lg",
        "transition-transform duration-200 hover:scale-110",
        progress <= 3 && "pointer-events-none",
      )}
      style={{ width: SIZE, height: SIZE, minHeight: SIZE }}
      aria-label={complete ? "Back to top" : `Reading progress: ${Math.round(progress)}%`}
    >
      <svg
        width={SIZE}
        height={SIZE}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
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

      {complete ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <span
          ref={textRef}
          className="text-[10px] font-medium text-muted-foreground"
          style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
        >
          0
        </span>
      )}
    </motion.button>
  );
}

// ── Main floating actions container ────────────────

export function FloatingActions() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Detect blog post pages (has a slug after /blog/)
  const isBlogPost = /\/blog\/.+/.test(pathname);

  useEffect(() => {
    let ticking = false;

    function update() {
      setVisible(window.scrollY > 400);
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
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3"
        >
          {/* Reading progress ring — blog posts only */}
          {isBlogPost && <ReadingRing />}

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={cn(
              "flex items-center justify-center rounded-full bg-accent text-white shadow-lg",
              "transition-transform duration-200 hover:scale-110",
              "h-11 w-11",
            )}
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
