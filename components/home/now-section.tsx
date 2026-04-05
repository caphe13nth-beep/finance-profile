"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useSettings } from "@/lib/settings-provider";
import { Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

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
    <section id="now" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          {lastUpdated && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("lastUpdated", { date: lastUpdated })}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <ul className="space-y-4">
            {now_section.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 text-xl" role="img" aria-hidden="true">
                  {item.emoji}
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {item.text}
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
