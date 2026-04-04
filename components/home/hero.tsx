"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { useSettings } from "@/lib/settings-provider";

export function Hero() {
  const { hero_content } = useSettings();

  return (
    <section id="hero" className="relative overflow-hidden py-20 sm:py-28">
      {/* Background pattern */}
      {hero_content.background_style === "grid" && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      )}
      {hero_content.background_style === "dots" && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
      )}
      {hero_content.background_style === "gradient" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-gold/5" />
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {hero_content.heading}
          </h1>

          {hero_content.subheading && (
            <p className="mt-3 text-lg font-medium text-accent sm:text-xl">
              {hero_content.subheading}
            </p>
          )}

          {hero_content.description && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {hero_content.description}
            </p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {hero_content.cta_primary_text && (
              <Link
                href={hero_content.cta_primary_link}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
              >
                {hero_content.cta_primary_text}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {hero_content.cta_secondary_text && (
              <Link
                href={hero_content.cta_secondary_link}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {hero_content.cta_secondary_text}
              </Link>
            )}

            {hero_content.show_cta_tertiary && hero_content.cta_tertiary_text && (
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Download className="h-4 w-4" />
                {hero_content.cta_tertiary_text}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
