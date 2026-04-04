import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { getPostBySlug, getRelatedPosts, getProfile } from "@/lib/supabase/queries";
import { mdxComponents } from "@/components/blog/mdx-components";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { AuthorCard } from "@/components/blog/author-card";
import { RelatedArticles } from "@/components/blog/related-articles";
import { articleMetadata } from "@/lib/metadata";
import { JsonLd, articleSchema } from "@/lib/json-ld";
import { BlogReactions } from "@/components/blog/blog-reactions";
import { ViewTracker } from "@/components/blog/view-tracker";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await getPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  return articleMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || "",
    slug: post.slug,
    image: post.featured_image,
    publishedAt: post.published_at,
    tags: post.tags,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const [{ data: post }, { data: profile }] = await Promise.all([
    getPostBySlug(slug),
    getProfile(),
  ]);

  if (!post) notFound();

  // Related posts: same category + overlapping tags, scored and ranked
  const { data: related } = await getRelatedPosts(
    post.id,
    post.category,
    post.tags
  );

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.seo_description || post.excerpt || "",
          slug: post.slug,
          image: post.featured_image,
          publishedAt: post.published_at,
          authorName: profile?.name ?? "FinanceProfile",
          authorImage: profile?.photo_url ?? null,
        })}
      />
      <ViewTracker postId={post.id} />
      <ReadingProgress />

      <article className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mt-6 max-w-3xl">
            {post.category && (
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {post.category}
              </span>
            )}

            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {date}
                </span>
              )}
              {post.reading_time_min != null && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.reading_time_min} min read
                </span>
              )}
            </div>
          </header>

          {/* Featured image */}
          {post.featured_image && (
            <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-2xl border border-border">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Body + sidebar */}
          <div className="mt-10 flex gap-12">
            {/* Main body */}
            <div data-article className="min-w-0 max-w-3xl flex-1">
              {post.body ? (
                <MDXRemote
                  source={post.body}
                  components={mdxComponents}
                />
              ) : (
                <p className="text-muted-foreground">
                  Article content is not available.
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Reactions */}
              <div className="mt-8 border-t border-border pt-6">
                <p className="mb-3 text-sm font-medium text-muted-foreground">Was this helpful?</p>
                <BlogReactions postId={post.id} />
              </div>

              {/* Author card */}
              {profile && (
                <div className="mt-10">
                  <AuthorCard
                    name={profile.name}
                    title={profile.title}
                    photo_url={profile.photo_url}
                    bio={profile.bio}
                  />
                </div>
              )}

              {/* Related articles */}
              <RelatedArticles posts={related ?? []} />
            </div>

            {/* Sidebar — TOC */}
            <aside className="hidden w-56 shrink-0 lg:block">
              <TableOfContents />
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
