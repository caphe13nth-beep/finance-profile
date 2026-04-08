"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────

interface TimelineEntry {
  id: string;
  year: number;
  title: string;
  organization: string | null;
  description: string | null;
  sort_order: number;
}

// Noise texture data URI — same film-grain as ProfileAvatar/Hero
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")";

// ── Progressive line (draws as user scrolls) ──────

function ScrollLine({ count }: { count: number }) {
  const lineRef = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const svg = lineRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const viewH = window.innerHeight;
      // Progress: 0 when top enters viewport, 1 when bottom exits
      const total = rect.height + viewH;
      const scrolled = viewH - rect.top;
      setProgress(Math.max(0, Math.min(1, scrolled / total)));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Total stroke length — approximation, the actual SVG line is 100% height
  const strokeLen = 1000;

  return (
    <svg
      ref={lineRef}
      className="absolute top-0 h-full w-px md:left-1/2 left-5"
      preserveAspectRatio="none"
      viewBox={`0 0 1 ${strokeLen}`}
      aria-hidden
    >
      <line
        x1="0.5" y1="0" x2="0.5" y2={strokeLen}
        stroke="var(--border)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="0.5" y1="0" x2="0.5" y2={strokeLen}
        stroke="var(--accent)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeDasharray={strokeLen}
        strokeDashoffset={strokeLen * (1 - progress)}
        style={{ transition: "stroke-dashoffset 0.1s linear" }}
      />
    </svg>
  );
}

// ── Dot that pulses when entering view ────────────

function TimelineDot({ inView }: { inView: boolean }) {
  return (
    <span
      className={cn(
        "absolute top-6 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-accent bg-background transition-all duration-500",
        "left-5 md:left-1/2",
        inView && "timeline-dot-pulse",
      )}
    />
  );
}

// ── Single card ───────────────────────────────────

function TimelineCard({
  entry,
  index,
  total,
}: {
  entry: TimelineEntry;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const isLeft = index % 2 === 0; // desktop alternation

  return (
    <div
      ref={ref}
      className={cn(
        "relative grid grid-cols-1 md:grid-cols-2",
        // Spacing between cards
        index < total - 1 && "pb-12 md:pb-16",
      )}
    >
      {/* Dot on the line */}
      <TimelineDot inView={inView} />

      {/* Card — desktop: alternates left/right. Mobile: always right of line. */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          // Mobile: single column, offset from left line
          "col-span-1 pl-12 md:pl-0",
          // Desktop alternation
          isLeft ? "md:col-start-1 md:pr-16 md:text-right" : "md:col-start-2 md:pl-16",
        )}
      >
        {/* Year badge */}
        <span
          className={cn(
            "inline-block font-mono text-2xl font-bold tracking-tight text-accent",
            "md:text-3xl",
          )}
        >
          {entry.year}
        </span>

        {/* Card body with paper texture */}
        <div
          className="mt-2 rounded-xl border border-border p-5"
          style={{
            background: `${NOISE_URI}, var(--card)`,
          }}
        >
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {entry.title}
          </h3>
          {entry.organization && (
            <p className="mt-0.5 text-sm font-medium text-accent">
              {entry.organization}
            </p>
          )}
          {entry.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {entry.description}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main export ───────────────────────────────────

export function CareerTimeline({
  entries,
}: {
  entries: TimelineEntry[];
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("Home");

  return (
    <section id="timeline" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("careerLabel")}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("careerHeading")}
          </h2>
        </motion.div>

        {/* Timeline */}
        {entries.length > 0 ? (
          <div className="relative mt-14 max-w-4xl mx-auto">
            <ScrollLine count={entries.length} />
            {entries.map((entry, i) => (
              <TimelineCard
                key={entry.id}
                entry={entry}
                index={i}
                total={entries.length}
              />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-muted-foreground">
            {t("timelineEmpty")}
          </p>
        )}
      </div>
    </section>
  );
}
