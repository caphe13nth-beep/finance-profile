import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { BlogList } from "@/components/blog/blog-list";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata({
  title: "Blog",
  description: "Market insights, investment strategies, and financial commentary.",
  path: "/blog",
});

export const revalidate = 3600;

export default async function BlogPage() {
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.blog) notFound();

  const { data: posts } = await getPublishedPosts();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Insights
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Market analysis, investment strategies, and financial perspectives.
          </p>
        </div>

        <div className="mt-10">
          <BlogList posts={posts ?? []} />
        </div>
      </div>
    </section>
  );
}
