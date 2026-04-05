"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Clock } from "lucide-react";
import { SHIMMER_16_9 } from "@/lib/shimmer";
import { useTranslations, useLocale } from "next-intl";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image: string | null;
  category: string | null;
  published_at: string | null;
  reading_time_min: number | null;
  [key: string]: unknown;
}

export function RelatedArticles({ posts }: { posts: RelatedPost[] }) {
  const t = useTranslations("Blog");
  const locale = useLocale();
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="font-heading text-2xl font-bold tracking-tight">
        {t("relatedArticles")}
      </h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const date = post.published_at
            ? new Date(post.published_at).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null;

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                {post.featured_image ? (
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL={SHIMMER_16_9}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/5 to-gold/5">
                    <span className="font-heading text-3xl font-bold text-muted-foreground/10">
                      {post.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {post.category && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent">
                      {post.category}
                    </span>
                  )}
                  {date && <span>{date}</span>}
                  {post.reading_time_min != null && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.reading_time_min} min
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-heading text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
