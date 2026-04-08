"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useSettings } from "@/lib/settings-provider";
import { useTranslations, useLocale } from "next-intl";

// Deterministic rotation per index — scattered sticky-note feel
function cardRotation(index: number): number {
  // Simple seeded rotation: -2 to +2 degrees
  const seed = ((index * 7 + 3) % 11) - 5; // range -5..5
  return (seed / 5) * 2; // scale to -2..+2
}

// Paper/cream noise texture for light mode
const PAPER_NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

export function NowSection() {
  const { now_section } = useSettings();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("Home");
  const locale = useLocale();

  if (!now_section.items.length) return null;

  const lastUpdated = now_section.last_updated
    ? new Date(now_section.last_updated).toLocaleDateString(locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <>
      {/* Handwriting font — loaded only when Now section renders */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500&display=swap"
      />

      <section id="now" ref={ref} className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t("nowLabel")}
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {t("nowHeading")}
            </h2>
          </motion.div>

          {/* Pinboard / scattered cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {now_section.items.map((item, i) => {
              const rotation = cardRotation(i);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.15 + i * 0.07,
                  }}
                  className="now-card group flex items-start gap-3.5 rounded-xl border px-5 py-4 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    rotate: `${rotation}deg`,
                    // Light mode: paper texture. Dark mode: handled by CSS class
                    backgroundImage: PAPER_NOISE,
                    backgroundColor: "var(--now-card-bg)",
                  }}
                >
                  <span className="shrink-0 text-2xl leading-none" role="img" aria-hidden>
                    {item.emoji}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Last updated — handwriting font */}
          {lastUpdated && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 text-base text-muted-foreground"
              style={{ fontFamily: '"Caveat", cursive' }}
            >
              {t("lastUpdated", { date: lastUpdated })}
            </motion.p>
          )}
        </div>
      </section>
    </>
  );
}
