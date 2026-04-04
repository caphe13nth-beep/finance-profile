import { notFound } from "next/navigation";
import { getProfile, getCareerTimeline } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { HeroBio } from "@/components/about/hero-bio";
import { SkillsGrid } from "@/components/about/skills-grid";
import { Certifications } from "@/components/about/certifications";
import { CareerTimeline } from "@/components/home/career-timeline";
import { siteMetadata } from "@/lib/metadata";
import { JsonLd, personSchema } from "@/lib/json-ld";

export const metadata = siteMetadata({
  title: "About",
  description: "Background, expertise, certifications, and career journey.",
  path: "/about",
});

export const revalidate = 3600;

interface Certification {
  name: string;
  issuer?: string;
  year?: number | string;
  url?: string;
}

export default async function AboutPage() {
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.about) notFound();

  const [{ data: profile }, { data: timeline }] = await Promise.all([
    getProfile(),
    getCareerTimeline(),
  ]);

  const name = profile?.name ?? "Finance Professional";
  const title = profile?.title ?? null;
  const bio = profile?.bio ?? null;
  const photoUrl = profile?.photo_url ?? null;
  const resumeUrl = profile?.resume_url ?? null;
  const skills: string[] = profile?.skills ?? [];
  const certifications: Certification[] = (profile?.certifications as Certification[]) ?? [];

  return (
    <>
      <JsonLd
        data={personSchema({
          name,
          title,
          bio,
          photoUrl,
          skills,
        })}
      />
      <HeroBio
        profile={{
          name,
          title,
          bio,
          photo_url: photoUrl,
          resume_url: resumeUrl,
        }}
      />
      <SkillsGrid skills={skills} />
      <CareerTimeline entries={timeline ?? []} />
      <Certifications certifications={certifications} />
    </>
  );
}
