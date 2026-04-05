import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCaseStudies } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { PortfolioKpi } from "@/components/portfolio/portfolio-kpi";
import { CaseStudyGrid } from "@/components/portfolio/case-study-grid";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata({
  title: "Portfolio",
  description: "Case studies and project outcomes across industries.",
  path: "/portfolio",
});

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Portfolio");
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.portfolio) notFound();

  const { data: caseStudies } = await getCaseStudies();
  const items = caseStudies ?? [];

  const industries = [...new Set(items.map((cs) => cs.industry).filter(Boolean))] as string[];

  // Compute average ROI from kpi_metrics if available
  const rois = items
    .map((cs) => {
      const m = cs.kpi_metrics as Record<string, unknown> | null;
      if (!m) return null;
      const val = m.roi ?? m.ROI ?? m.return ?? null;
      if (val == null) return null;
      return typeof val === "number" ? val : parseFloat(String(val)) || null;
    })
    .filter((v): v is number => v !== null);

  const avgRoi =
    rois.length > 0
      ? `${(rois.reduce((a, b) => a + b, 0) / rois.length).toFixed(1)}%`
      : null;

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

        {/* KPI summary */}
        <div className="mt-10">
          <PortfolioKpi
            totalProjects={items.length}
            industries={industries}
            avgRoi={avgRoi}
          />
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <div className="mt-12">
            <CaseStudyGrid caseStudies={items} />
          </div>
        ) : (
          <p className="mt-12 text-muted-foreground">
            {t("empty")}
          </p>
        )}
      </div>
    </section>
  );
}
