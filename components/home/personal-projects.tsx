"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { SHIMMER_16_9 } from "@/lib/shimmer";
import { ExternalLink, Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface Project {
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

export function PersonalProjects({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("Home");

  if (projects.length === 0) return null;

  return (
    <section id="projects" ref={ref} className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("projectsLabel")}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("projectsHeading")}
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                {project.image_url ? (
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL={SHIMMER_16_9}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/5 to-chart-2/5">
                    <span className="font-heading text-3xl font-bold text-muted-foreground/10">
                      {project.title.charAt(0)}
                    </span>
                  </div>
                )}
                {project.is_featured && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                    <Star className="h-3 w-3" /> {t("featured")}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                {/* Category */}
                {project.category && (
                  <span className="mb-2 inline-block self-start rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
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

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Link */}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-accent transition-colors hover:text-accent/80"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("viewProject")}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
