"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import {
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  ThumbsUp,
  Lightbulb,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SHIMMER_16_9 } from "@/lib/shimmer";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  tags: string[] | null;
  published_at: string | null;
  reading_time_min: number | null;
  view_count?: number;
}

type ReactionCounts = Record<string, Record<string, number>>;

const POSTS_PER_PAGE = 9;

// Accent background colors for text-only cards (cycling)
const ACCENT_BGS = [
  "bg-accent/[0.06]",
  "bg-[var(--chart-2)]/[0.06]",
  "bg-[var(--chart-4)]/[0.06]",
];

// ── Helpers ────────────────────────────────────────

function estimateReadingTime(content: string | null, fallback: number | null): number {
  if (fallback != null) return fallback;
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(iso: string | null, locale: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Reaction badges ────────────────────────────────

const REACTION_ICONS = [
  { key: "like", Icon: ThumbsUp },
  { key: "insightful", Icon: Lightbulb },
  { key: "fire", Icon: Flame },
] as const;

function ReactionBadges({ counts }: { counts?: Record<string, number> }) {
  if (!counts) return null;
  const visible = REACTION_ICONS.filter(({ key }) => (counts[key] ?? 0) > 0);
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {visible.map(({ key, Icon }) => (
        <span key={key} className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <Icon className="h-3 w-3" />
          {counts[key]}
        </span>
      ))}
    </div>
  );
}

// ── Meta row (date, reading time, views) ───────────

function Meta({
  date,
  readMin,
  views,
}: {
  date: string | null;
  readMin: number;
  views: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {date && <span>{date}</span>}
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {readMin} min
      </span>
      {views > 0 && (
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {views.toLocaleString()}
        </span>
      )}
    </div>
  );
}

// ── Hero card (first/featured post) ────────────────

function HeroCard({
  post,
  locale,
  readMin,
  reactions,
}: {
  post: BlogPost;
  locale: string;
  readMin: number;
  reactions?: Record<string, number>;
}) {
  const date = formatDate(post.published_at, locale);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-2xl sm:min-h-[440px]"
    >
      {/* Background image with hover zoom */}
      {post.featured_image ? (
        <Image
          src={post.featured_image}
          alt={post.title}
          fill
          sizes="100vw"
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          placeholder="blur"
          blurDataURL={SHIMMER_16_9}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10" />
      )}

      {/* Gradient overlay — bottom-heavy */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Category pill — top left */}
      {post.category && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {post.category}
        </span>
      )}

      {/* Content overlay */}
      <div className="relative z-10 p-6 sm:p-8">
        <h3 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/70">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4">
          <Meta
            date={date}
            readMin={readMin}
            views={post.view_count ?? 0}
          />
          <ReactionBadges counts={reactions} />
        </div>
      </div>
    </Link>
  );
}

// ── Standard card (image-top or text-only) ─────────

function StandardCard({
  post,
  locale,
  readMin,
  reactions,
  variant,
  accentIdx,
}: {
  post: BlogPost;
  locale: string;
  readMin: number;
  reactions?: Record<string, number>;
  variant: "image" | "text";
  accentIdx: number;
}) {
  const date = formatDate(post.published_at, locale);

  if (variant === "image") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-accent/40 hover:shadow-lg"
      >
        {/* Image with hover zoom */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              placeholder="blur"
              blurDataURL={SHIMMER_16_9}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5">
              <span className="font-heading text-4xl font-bold text-muted-foreground/10">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
          {post.category && (
            <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium text-accent shadow-sm backdrop-blur-sm">
              {post.category}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-heading text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <Meta date={date} readMin={readMin} views={post.view_count ?? 0} />
            <ReactionBadges counts={reactions} />
          </div>
        </div>
      </Link>
    );
  }

  // Text-only card with colored accent background
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col rounded-xl border border-border p-6 transition-all duration-300 hover:border-accent",
        ACCENT_BGS[accentIdx % ACCENT_BGS.length],
      )}
    >
      {post.category && (
        <span className="mb-3 w-fit rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {post.category}
        </span>
      )}
      <h3 className="font-heading text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {post.excerpt}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <Meta date={date} readMin={readMin} views={post.view_count ?? 0} />
        <ReactionBadges counts={reactions} />
      </div>
    </Link>
  );
}

// ── Main export ────────────────────────────────────

export function BlogList({
  posts,
  reactionCounts = {},
}: {
  posts: BlogPost[];
  reactionCounts?: ReactionCounts;
}) {
  const t = useTranslations("Blog");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const cats = posts.map((p) => p.category).filter((c): c is string => !!c);
    return [...new Set(cats)].sort();
  }, [posts]);

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory) result = result.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt?.toLowerCase().includes(q) ?? false) ||
          (p.category?.toLowerCase().includes(q) ?? false) ||
          (p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false),
      );
    }
    return result;
  }, [posts, activeCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    setPage(1);
  }
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  // Split: first post is hero, rest alternate image/text
  const heroPost = paged[0] ?? null;
  const restPosts = paged.slice(1);

  return (
    <div>
      {/* ── Search + Filters ──────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                activeCategory === null
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t("all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-accent text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Cards ─────────────────────────────────────── */}
      {paged.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${search}-${safePage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-8"
          >
            {/* Hero card — full width */}
            {heroPost && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <HeroCard
                  post={heroPost}
                  locale={locale}
                  readMin={estimateReadingTime(heroPost.content, heroPost.reading_time_min)}
                  reactions={reactionCounts[heroPost.id]}
                />
              </motion.div>
            )}

            {/* Remaining cards — masonry-ish grid */}
            {restPosts.length > 0 && (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restPosts.map((post, i) => {
                  // Alternate: posts with images get image cards,
                  // posts without get text-only. Also every 3rd with-image
                  // gets text-only for rhythm.
                  const hasImage = !!post.featured_image;
                  const variant: "image" | "text" =
                    hasImage && i % 3 !== 2 ? "image" : "text";
                  // Track text-card index for accent color cycling
                  let textIdx = 0;

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: (i + 1) * 0.05 }}
                    >
                      <StandardCard
                        post={post}
                        locale={locale}
                        readMin={estimateReadingTime(post.content, post.reading_time_min)}
                        reactions={reactionCounts[post.id]}
                        variant={variant}
                        accentIdx={variant === "text" ? textIdx++ : 0}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          {t("noResults")}
        </p>
      )}

      {/* ── Pagination ────────────────────────────────── */}
      {totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            aria-label={t("previousPage")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-md text-sm font-medium transition-colors",
                n === safePage
                  ? "bg-accent text-white"
                  : "border border-border text-foreground hover:bg-muted",
              )}
              aria-current={n === safePage ? "page" : undefined}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            aria-label={t("nextPage")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
