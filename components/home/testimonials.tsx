"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useTranslations } from "next-intl";

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  quote: string;
  avatar_url: string | null;
  sort_order: number;
}

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [current, setCurrent] = useState(0);

  const t = useTranslations("Home");

  if (testimonials.length === 0) return null;

  const prev = () =>
    setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () =>
    setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const item = testimonials[current];

  return (
    <section
      id="testimonials"
      ref={ref}
      className="border-y border-border bg-muted/30 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("testimonialsLabel")}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("testimonialsHeading")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative mt-12 flex flex-col items-center"
        >
          <div
            className="w-full max-w-2xl touch-pan-y"
            onTouchStart={(e) => { (e.currentTarget as HTMLDivElement).dataset.touchX = String(e.touches[0].clientX); }}
            onTouchEnd={(e) => {
              const startX = Number((e.currentTarget as HTMLDivElement).dataset.touchX ?? 0);
              const diff = (e.changedTouches[0]?.clientX ?? 0) - startX;
              if (Math.abs(diff) > 50) { diff > 0 ? prev() : next(); }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10"
              >
                <Quote className="mx-auto h-8 w-8 text-accent/30" />

                <blockquote className="mt-6 text-lg leading-relaxed text-foreground sm:text-xl">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                <div className="mt-6 flex flex-col items-center gap-3">
                  {item.avatar_url ? (
                    <Image
                      src={item.avatar_url}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 font-heading text-lg font-bold text-accent">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-heading font-semibold text-foreground">
                      {item.name}
                    </p>
                    {item.company && (
                      <p className="text-sm text-muted-foreground">
                        {item.company}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={prev}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label={t("previousTestimonial")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === current
                        ? "w-6 bg-accent"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={t("goToTestimonial", { number: i + 1 })}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label={t("nextTestimonial")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
