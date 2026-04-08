"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { useSettings } from "@/lib/settings-provider";
import { cn } from "@/lib/utils";

// Same noise URI used in ProfileAvatar — lightweight film-grain texture
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

export function Hero() {
  const { hero_content, site_identity } = useSettings();
  const coverUrl = site_identity.cover_image_url;
  const overlay = site_identity.cover_overlay ?? "gradient-mesh";
  const hasCover = !!coverUrl;

  // ── Parallax: translate cover image at 0.5× scroll speed ──
  const sectionRef = useRef<HTMLElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [coverLoaded, setCoverLoaded] = useState(false);

  useEffect(() => {
    if (!hasCover) return;

    // Disable parallax on mobile (matchMedia is cheaper than resize)
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          // Only calculate when in viewport
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            setOffsetY(-rect.top * 0.5);
          }
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasCover]);

  // Overlay gradient based on setting
  const overlayGradient =
    overlay === "gradient-mesh"
      ? "radial-gradient(ellipse at 20% 80%, var(--background) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--background) 60%, transparent) 0%, transparent 50%), linear-gradient(to top, var(--background) 0%, color-mix(in srgb, var(--background) 40%, transparent) 50%, transparent 100%)"
      : overlay === "gradient-linear"
        ? "linear-gradient(to top, var(--background) 0%, color-mix(in srgb, var(--background) 60%, transparent) 40%, transparent 100%)"
        : overlay === "dark-vignette"
          ? "radial-gradient(ellipse at center, transparent 30%, var(--background) 100%)"
          : "none";

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={cn(
        "relative overflow-hidden",
        hasCover ? "min-h-[70vh] py-28 sm:py-36" : "py-20 sm:py-28",
      )}
    >
      {/* ── Cover image background ── */}
      {hasCover && (
        <>
          {/* Parallax image layer */}
          <div
            className="pointer-events-none absolute inset-0 -top-[20%] bottom-0 h-[120%] w-full md:will-change-transform"
            style={{ transform: `translateY(${offsetY}px)` }}
          >
            <Image
              src={coverUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className={cn(
                "object-cover transition-opacity duration-700",
                coverLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setCoverLoaded(true)}
            />
          </div>

          {/* Color overlay (gradient-mesh / linear / vignette) */}
          {overlay !== "none" && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: overlayGradient }}
            />
          )}

          {/* Noise texture at low opacity */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: NOISE_URI, backgroundRepeat: "repeat" }}
          />
        </>
      )}

      {/* ── Non-cover background patterns (existing) ── */}
      {!hasCover && hero_content.background_style === "grid" && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      )}
      {!hasCover && hero_content.background_style === "dots" && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
      )}
      {!hasCover && hero_content.background_style === "gradient" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-gold/5" />
      )}

      {/* ── Hero content ── */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={cn(
            "max-w-3xl",
            hasCover &&
              "rounded-2xl border border-white/10 bg-background/60 px-8 py-10 shadow-2xl backdrop-blur-xl sm:px-12 sm:py-14",
          )}
        >
          <h1
            className={cn(
              "font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
              hasCover && "text-foreground drop-shadow-sm",
            )}
          >
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
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
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
