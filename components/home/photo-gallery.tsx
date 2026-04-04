"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [filter, setFilter] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const categories = useMemo(
    () => [...new Set(photos.map((p) => p.category).filter(Boolean))] as string[],
    [photos]
  );

  const filtered = filter ? photos.filter((p) => p.category === filter) : photos;

  function openLightbox(index: number) { setLightbox(index); }
  function closeLightbox() { setLightbox(null); }
  function prev() { setLightbox((i) => (i !== null && i > 0 ? i - 1 : i)); }
  function next() { setLightbox((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i)); }

  if (photos.length === 0) return null;

  return (
    <section id="gallery" ref={ref} className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Gallery
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Photo Gallery
          </h2>
        </motion.div>

        {/* Category filters */}
        {categories.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === null ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === cat ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Masonry grid */}
        <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {filtered.map((photo, i) => (
            <motion.button
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: (i % 8) * 0.06 }}
              onClick={() => openLightbox(i)}
              className="group relative w-full overflow-hidden rounded-xl border border-border"
            >
              <Image
                src={photo.image_url}
                alt={photo.caption ?? ""}
                width={400}
                height={300}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-xs text-white">{photo.caption}</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close">
              <X className="h-5 w-5" />
            </button>

            {lightbox > 0 && (
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {lightbox < filtered.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 top-1/2 -translate-y-1/2" aria-label="Next">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-4xl"
            >
              <Image
                src={filtered[lightbox].image_url}
                alt={filtered[lightbox].caption ?? ""}
                width={1200}
                height={800}
                className="max-h-[80vh] w-auto rounded-lg object-contain"
              />
              {filtered[lightbox].caption && (
                <p className="mt-3 text-center text-sm text-white/80">
                  {filtered[lightbox].caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
