"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SHIMMER_16_9 } from "@/lib/shimmer";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  link: string | null;
  tags: string[] | null;
  is_featured: boolean;
  sort_order: number;
}

// ── Tag filter with sliding underline ──────────────

function TagFilter({
  tags,
  active,
  onChange,
  allLabel,
}: {
  tags: string[];
  active: string | null;
  onChange: (tag: string | null) => void;
  allLabel: string;
}) {
  const items = [{ key: null, label: allLabel }, ...tags.map((t) => ({ key: t, label: t }))];

  return (
    <div className="scrollbar-none flex gap-1 overflow-x-auto pb-1">
      {items.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key ?? "__all__"}
            onClick={() => onChange(key)}
            className={cn(
              "relative shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              isActive ? "text-accent" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {isActive && (
              <motion.span
                layoutId="project-filter-underline"
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

// ── Card wrapper (handles link) ────────────────────

function CardLink({
  href,
  children,
  className,
}: {
  href: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  if (!href) return <div className={className}>{children}</div>;

  const isExternal = href.startsWith("http");
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

// ── Featured card (2-col span, image background) ───

function FeaturedCard({
  project,
  t,
}: {
  project: Project;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <CardLink
      href={project.link}
      className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl sm:col-span-2 sm:row-span-2 sm:min-h-[400px]"
    >
      {/* Background image with hover shift */}
      {project.image_url ? (
        <Image
          src={project.image_url}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          placeholder="blur"
          blurDataURL={SHIMMER_16_9}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Category pill */}
      {project.category && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {project.category}
        </span>
      )}

      {/* Content overlay */}
      <div className="relative z-10 p-6 sm:p-8">
        <h3 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          {project.title}
        </h3>
        {project.description && (
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/70">
            {project.description}
          </p>
        )}

        {/* Tech tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/70 backdrop-blur-sm"
                style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Reveal link on hover */}
        {project.link && (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {t("viewProject")}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </CardLink>
  );
}

// ── Regular card (1x1) ─────────────────────────────

function RegularCard({
  project,
  t,
}: {
  project: Project;
  t: ReturnType<typeof useTranslations>;
}) {
  const hasImage = !!project.image_url;

  return (
    <CardLink
      href={project.link}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border transition-all duration-300",
        hasImage
          ? "border-border bg-card hover:shadow-lg"
          : "border-border bg-card hover:border-accent hover:shadow-[0_0_16px_-4px_var(--accent)]",
      )}
    >
      {/* Image top half with hover reveal */}
      {hasImage && (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={project.image_url!}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03]"
            placeholder="blur"
            blurDataURL={SHIMMER_16_9}
          />
          {project.category && (
            <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium text-accent shadow-sm backdrop-blur-sm">
              {project.category}
            </span>
          )}
        </div>
      )}

      {/* Text bottom half */}
      <div className="flex flex-1 flex-col p-5">
        {!hasImage && project.category && (
          <span className="mb-2 w-fit rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            {project.category}
          </span>
        )}

        <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
          {project.title}
        </h3>

        {project.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}

        {/* Tech tags — monospace */}
        {project.tags && project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* View project link — revealed on hover for image cards */}
        {project.link && (
          <span
            className={cn(
              "mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-accent transition-opacity",
              hasImage ? "opacity-0 group-hover:opacity-100" : "",
            )}
          >
            {t("viewProject")}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </CardLink>
  );
}

// ── Homepage section ───────────────────────────────

export function PersonalProjects({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("Home");

  if (projects.length === 0) return null;

  const featured = projects.filter((p) => p.is_featured);
  const regular = projects.filter((p) => !p.is_featured);

  return (
    <section id="projects" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t("projectsLabel")}
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {t("projectsHeading")}
            </h2>
          </div>
          {projects.length > 6 && (
            <Link
              href="/projects"
              className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:inline-flex"
            >
              {t("viewAllProjects")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </motion.div>

        {/* Bento grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 1).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="sm:col-span-2 sm:row-span-2"
            >
              <FeaturedCard project={p} t={t} />
            </motion.div>
          ))}
          {regular.slice(0, featured.length > 0 ? 3 : 6).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: (i + 1) * 0.08 }}
            >
              <RegularCard project={p} t={t} />
            </motion.div>
          ))}
        </div>

        {projects.length > 6 && (
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              {t("viewAllProjects")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Full projects page component ───────────────────

export function PersonalProjectsFull({ projects }: { projects: Project[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const t = useTranslations("Home");

  const allTags = useMemo(() => {
    const tags = projects.flatMap((p) => p.tags ?? []);
    return [...new Set(tags)].sort();
  }, [projects]);

  const filtered = activeTag
    ? projects.filter((p) => p.tags?.includes(activeTag))
    : projects;

  const featured = filtered.filter((p) => p.is_featured);
  const regular = filtered.filter((p) => !p.is_featured);

  return (
    <div>
      {allTags.length > 1 && (
        <TagFilter
          tags={allTags}
          active={activeTag}
          onChange={setActiveTag}
          allLabel={t("allFilter")}
        />
      )}

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="sm:col-span-2 sm:row-span-2"
              layout
            >
              <FeaturedCard project={p} t={t} />
            </motion.div>
          ))}
          {regular.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i + featured.length) * 0.06 }}
              layout
            >
              <RegularCard project={p} t={t} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          No projects match this filter.
        </p>
      )}
    </div>
  );
}
