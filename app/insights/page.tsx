import { notFound } from "next/navigation";
import { getMarketInsights } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { InsightsList } from "@/components/insights/insights-list";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata({
  title: "Market Insights",
  description: "Investment theses, market analysis, and asset research across sectors.",
  path: "/insights",
});

export const revalidate = 3600;

export default async function InsightsPage() {
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.market_insights) notFound();

  const { data: insights } = await getMarketInsights();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Research
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Market Insights
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            In-depth analysis, investment theses, and actionable research
            across asset classes and sectors.
          </p>
        </div>

        <div className="mt-10">
          <InsightsList insights={insights ?? []} />
        </div>
      </div>
    </section>
  );
}
