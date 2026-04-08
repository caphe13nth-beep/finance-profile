"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSettings } from "@/lib/settings-provider";
import { cn } from "@/lib/utils";

// ── Accent border colors — creates a color rhythm across the row ──
const BORDER_COLORS = [
  "var(--accent)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// ── Animated number counter (rAF-based, no library) ───────────

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration]);

  return value;
}

// ── Single stat card ──────────────────────────────────────────

function StatCard({
  label,
  value,
  prefix,
  suffix,
  index,
}: {
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const display = useCountUp(value, inView);
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <div
      ref={ref}
      className="group relative min-w-[160px] shrink-0 snap-start border-l-2 py-5 pl-5 pr-4 transition-colors sm:min-w-0"
      style={{ borderLeftColor: borderColor }}
    >
      {/* Number */}
      <span
        className={cn(
          "block font-heading font-bold tracking-tight text-foreground transition-colors duration-300",
          "text-[clamp(3rem,5vw,5rem)] leading-none",
          "group-hover:text-[var(--accent)]",
        )}
      >
        {prefix && <span className="text-[0.6em] align-baseline">{prefix}</span>}
        {display.toLocaleString()}
        {suffix && <span className="text-[0.6em] align-baseline">{suffix}</span>}
      </span>

      {/* Label with sliding underline on hover */}
      <span className="relative mt-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>
        {label}
        <span
          className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full"
        />
      </span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────

export function KpiStats() {
  const { stats_bar } = useSettings();

  if (!stats_bar.stats.length) return null;

  return (
    <section
      id="stats"
      className="stats-bar-section relative py-16 sm:py-20"
    >
      {/* Diagonal stripe pattern at 2% opacity */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(135deg, transparent, transparent 10px, var(--foreground) 10px, var(--foreground) 11px)",
          opacity: 0.02,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile: horizontal scroll. Desktop: grid */}
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-5 lg:gap-6">
          {stats_bar.stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
