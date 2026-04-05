import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import dynamic from "next/dynamic";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { siteMetadata } from "@/lib/metadata";
import { CardSkeleton } from "@/components/ui/skeleton";

export const metadata = siteMetadata({
  title: "Financial Tools",
  description: "Free financial calculators — compound interest, retirement planner, loan amortization, and ROI analysis.",
  path: "/tools",
});

const CalcSkeleton = () => <CardSkeleton />;

const CompoundInterestCalculator = dynamic(
  () => import("@/components/calculators/compound-interest").then(m => m.CompoundInterestCalculator),
  { loading: CalcSkeleton }
);
const RetirementCalculator = dynamic(
  () => import("@/components/calculators/retirement").then(m => m.RetirementCalculator),
  { loading: CalcSkeleton }
);
const LoanCalculator = dynamic(
  () => import("@/components/calculators/loan").then(m => m.LoanCalculator),
  { loading: CalcSkeleton }
);
const RoiCalculator = dynamic(
  () => import("@/components/calculators/roi").then(m => m.RoiCalculator),
  { loading: CalcSkeleton }
);

export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Tools");
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.tools) notFound();

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

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <CompoundInterestCalculator />
          <RetirementCalculator />
          <LoanCalculator />
          <RoiCalculator />
        </div>
      </div>
    </section>
  );
}
