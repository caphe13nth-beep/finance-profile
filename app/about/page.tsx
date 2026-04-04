import { notFound } from "next/navigation";
import { getProfile, getCareerTimeline, getPhotoGallery, getHobbiesInterests } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { AboutLayout } from "@/components/about/about-layout";
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

  const safe = async <T,>(fn: () => Promise<{ data: T | null }>): Promise<T | null> => {
    try { return (await fn()).data; } catch { return null; }
  };

  const [profile, timeline, photos, hobbies] = await Promise.all([
    safe(getProfile),
    safe(getCareerTimeline),
    safe(getPhotoGallery),
    safe(getHobbiesInterests),
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
      <AboutLayout
        mode={settings.site_identity.site_mode}
        profile={{
          name,
          title,
          bio,
          photo_url: photoUrl,
          resume_url: resumeUrl,
          skills,
          certifications,
        }}
        timeline={timeline ?? []}
        photos={photos ?? []}
        hobbies={hobbies ?? []}
      />
    </>
  );
}
