import { notFound } from "next/navigation";
import { getResources } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata({
  title: "Resources",
  description: "Download whitepapers, templates, guides, and financial reports.",
  path: "/resources",
});

export const revalidate = 3600;

export default async function ResourcesPage() {
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.resources) notFound();

  const { data: resources } = await getResources();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Resources
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Downloads &amp; Guides
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Free whitepapers, templates, and guides to help you navigate
            markets and optimize your financial strategy.
          </p>
        </div>

        <div className="mt-10">
          <ResourceGrid resources={resources ?? []} />
        </div>
      </div>
    </section>
  );
}
