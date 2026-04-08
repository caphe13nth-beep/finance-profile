import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPersonalProjects } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { PersonalProjectsFull } from "@/components/home/personal-projects";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata({
  title: "Projects",
  description: "Side projects, experiments, and things I've built.",
  path: "/projects",
});

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settings = await fetchAllSettings();
  if (!settings.section_visibility.personal_projects) notFound();

  const t = await getTranslations("Home");
  const { data: projects } = await getPersonalProjects();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("projectsLabel")}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {t("projectsHeading")}
          </h1>
        </div>

        <div className="mt-10">
          <PersonalProjectsFull projects={projects ?? []} />
        </div>
      </div>
    </section>
  );
}
