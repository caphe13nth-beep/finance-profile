import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublishedPostsByLocale, getBlogReactionCounts } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { BlogList } from "@/components/blog/blog-list";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata({
  title: "Blog",
  description: "Market insights, investment strategies, and financial commentary.",
  path: "/blog",
});

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.blog) notFound();

  const [{ data: posts }, { data: reactionCounts }] = await Promise.all([
    getPublishedPostsByLocale(locale),
    getBlogReactionCounts(),
  ]);

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("label")}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="mt-10">
          <BlogList posts={posts ?? []} reactionCounts={reactionCounts ?? {}} />
        </div>
      </div>
    </section>
  );
}
