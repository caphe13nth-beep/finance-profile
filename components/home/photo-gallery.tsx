"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────

export interface Photo {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
}

// ── Category filter with sliding underline ─────────

function CategoryFilter({
  categories,
  active,
  onChange,
  allLabel,
}: {
  categories: string[];
  active: string | null;
  onChange: (cat: string | null) => void;
  allLabel: string;
}) {
  const items = [{ key: null, label: allLabel }, ...categories.map((c) => ({ key: c, label: c }))];

  return (
    <div className="scrollbar-none mt-6 flex gap-1 overflow-x-auto pb-1">
      {items.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key ?? "__all__"}
            onClick={() => onChange(key)}
            className={cn(
              "relative shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {isActive && (
              <motion.span
                layoutId="gallery-filter-underline"
                className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Blur-up image ──────────────────────────────────

function GalleryImage({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl"
    >
      {/* Blurred placeholder */}
      <img
        src={src}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-500",
          loaded ? "opacity-0" : "opacity-100",
        )}
      />

      {/* Full image */}
      <Image
        src={src}
        alt={alt}
        width={600}
        height={450}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          "relative w-full object-cover transition-all duration-500 group-hover:scale-[1.03]",
          loaded ? "opacity-100" : "opacity-0",
        )}
        onLoad={() => setLoaded(true)}
      />

      {/* Caption overlay on hover */}
      {alt && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-xs text-white">{alt}</p>
        </div>
      )}
    </button>
  );
}

// ── Lightbox ───────────────────────────────────────

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
  t,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const photo = photos[index];
  const touchRef = useRef(0);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => { touchRef.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = (e.changedTouches[0]?.clientX ?? 0) - touchRef.current;
        if (Math.abs(diff) > 50) { diff > 0 ? onPrev() : onNext(); }
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
        aria-label={t("close")}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
          aria-label={t("previous")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Next */}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
          aria-label={t("next")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Image + caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[88vh] max-w-5xl flex-col items-center px-4"
        >
          <Image
            src={photo.image_url}
            alt={photo.caption ?? ""}
            width={1400}
            height={900}
            className="max-h-[80vh] w-auto rounded-lg object-contain"
            priority
          />
          {photo.caption && (
            <p className="mt-3 text-center text-sm text-white/70">
              {photo.caption}
            </p>
          )}
          <p className="mt-1 text-xs text-white/30">
            {index + 1} / {photos.length}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ── Homepage section (max 6, with "View all") ──────

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("Home");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const preview = photos.slice(0, 6);

  const closeLb = useCallback(() => setLightbox(null), []);
  const prevLb = useCallback(() => setLightbox((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextLb = useCallback(
    () => setLightbox((i) => (i !== null && i < preview.length - 1 ? i + 1 : i)),
    [preview.length],
  );

  if (photos.length === 0) return null;

  return (
    <section id="gallery" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t("galleryLabel")}
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {t("galleryHeading")}
            </h2>
          </div>
          {photos.length > 6 && (
            <Link
              href="/gallery"
              className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:inline-flex"
            >
              {t("viewAllGallery")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </motion.div>

        {/* 3-column grid for homepage preview */}
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {preview.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <GalleryImage
                src={photo.image_url}
                alt={photo.caption ?? ""}
                onClick={() => setLightbox(i)}
              />
            </motion.div>
          ))}
        </div>

        {photos.length > 6 && (
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              {t("viewAllGallery")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && preview[lightbox] && (
          <Lightbox
            photos={preview}
            index={lightbox}
            onClose={closeLb}
            onPrev={prevLb}
            onNext={nextLb}
            t={t}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ── Full gallery (for dedicated page) ──────────────

export function PhotoGalleryFull({ photos }: { photos: Photo[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const t = useTranslations("Home");

  const categories = useMemo(
    () => [...new Set(photos.map((p) => p.category).filter(Boolean))] as string[],
    [photos],
  );

  const filtered = filter ? photos.filter((p) => p.category === filter) : photos;

  const closeLb = useCallback(() => setLightbox(null), []);
  const prevLb = useCallback(() => setLightbox((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextLb = useCallback(
    () => setLightbox((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i)),
    [filtered.length],
  );

  return (
    <div>
      {/* Category filter with animated underline */}
      {categories.length > 1 && (
        <CategoryFilter
          categories={categories}
          active={filter}
          onChange={setFilter}
          allLabel={t("allFilter")}
        />
      )}

      {/* Masonry grid */}
      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {filtered.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: (i % 9) * 0.05 }}
            layout
          >
            <GalleryImage
              src={photo.image_url}
              alt={photo.caption ?? ""}
              onClick={() => setLightbox(i)}
            />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No photos in this category.
        </p>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <Lightbox
            photos={filtered}
            index={lightbox}
            onClose={closeLb}
            onPrev={prevLb}
            onNext={nextLb}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
