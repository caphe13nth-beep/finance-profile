"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { InlineProfileAvatar } from "@/components/ui/profile-avatar";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  quote: string;
  avatar_url: string | null;
  sort_order: number;
}

// Initials from full name (first + last initial)
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0] ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Component ──────────────────────────────────────

const INTERVAL = 6000;

const slideVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const t = useTranslations("Home");

  const count = testimonials.length;

  const goNext = useCallback(
    () => setCurrent((c) => (c + 1) % count),
    [count],
  );
  const goPrev = useCallback(
    () => setCurrent((c) => (c - 1 + count) % count),
    [count],
  );

  // Auto-rotate — pause on hover
  useEffect(() => {
    if (count <= 1 || hovered) return;
    const id = setInterval(goNext, INTERVAL);
    return () => clearInterval(id);
  }, [count, hovered, goNext]);

  if (count === 0) return null;

  const item = testimonials[current];

  return (
    <>
      {/* Editorial serif font — loaded only when testimonials render */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&display=swap"
      />

      <section
        id="testimonials"
        ref={sectionRef}
        className="relative overflow-hidden py-20 sm:py-28"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Radial gradient background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--accent) 6%, transparent), transparent)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t("testimonialsLabel")}
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {t("testimonialsHeading")}
            </h2>
          </motion.div>

          {/* Quote area */}
          <div className="relative mt-14 flex min-h-[280px] flex-col items-center justify-center text-center">
            {/* Decorative opening quotation mark */}
            <span
              className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 select-none text-accent/[0.08] dark:text-accent/[0.12]"
              style={{
                fontSize: "8rem",
                lineHeight: 1,
                fontFamily: '"Cormorant Garamond", "Georgia", serif',
              }}
              aria-hidden
            >
              &ldquo;
            </span>

            <AnimatePresence mode="wait">
              <motion.div
                key={item.id}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                {/* Quote text */}
                <blockquote
                  className="max-w-2xl text-xl leading-relaxed text-foreground sm:text-2xl md:text-[1.65rem] md:leading-[1.6]"
                  style={{
                    fontFamily: '"Cormorant Garamond", "Georgia", serif',
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  {item.quote}
                </blockquote>

                {/* Author */}
                <div className="mt-8 flex items-center gap-3">
                  <InlineProfileAvatar
                    src={item.avatar_url}
                    fallback={initials(item.name)}
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    {item.company && (
                      <p className="text-xs text-muted-foreground">
                        {item.company}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {count > 1 && (
            <div className="mt-8 flex items-center justify-center gap-5">
              {/* Left arrow — visible on mobile, hover-reveal on desktop */}
              <button
                onClick={goPrev}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-muted",
                  "md:opacity-0 md:group-hover:opacity-100",
                  hovered && "md:opacity-100",
                )}
                aria-label={t("previousTestimonial")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="flex gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === current
                        ? "w-6 bg-accent"
                        : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50",
                    )}
                    aria-label={t("goToTestimonial", { number: i + 1 })}
                  />
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={goNext}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-muted",
                  "md:opacity-0 md:group-hover:opacity-100",
                  hovered && "md:opacity-100",
                )}
                aria-label={t("nextTestimonial")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
