import dynamic from "next/dynamic";
import {
  getPublishedPosts, getCaseStudies, getCareerTimeline, getTestimonials,
  getProfile, getPersonalProjects, getPhotoGallery, getHobbiesInterests,
} from "@/lib/supabase/queries";
import { JsonLd, reviewSchema } from "@/lib/json-ld";
import { Hero } from "@/components/home/hero";
import { PersonalIntro } from "@/components/home/personal-intro";
import { NowSection } from "@/components/home/now-section";
import { LatestInsights } from "@/components/home/latest-insights";
import { CareerTimeline } from "@/components/home/career-timeline";
import { Testimonials } from "@/components/home/testimonials";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { PhotoGallery } from "@/components/home/photo-gallery";
import { HobbiesSection } from "@/components/home/hobbies-section";
import { PersonalProjects } from "@/components/home/personal-projects";
import { ConditionalSection } from "@/components/home/home-sections";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/skeleton";

const KpiStats = dynamic(() => import("@/components/home/kpi-stats").then(m => m.KpiStats), {
  loading: () => <div className="py-16 sm:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">{Array.from({length:5}).map((_,i)=><KpiSkeleton key={i}/>)}</div></div></div>,
});

const FeaturedCaseStudy = dynamic(() => import("@/components/home/featured-case-study").then(m => m.FeaturedCaseStudy), {
  loading: () => <div className="border-y border-border bg-muted/30 py-16"><div className="mx-auto max-w-7xl px-4"><CardSkeleton /></div></div>,
});

export const revalidate = 3600;

async function safeQuery<T>(fn: () => Promise<{ data: T | null; error?: { message: string } | null }>, label?: string): Promise<T | null> {
  try {
    const result = await fn();
    if (result.error) {
      console.warn(`[home] query ${label ?? fn.name} error:`, result.error.message);
    }
    return result.data;
  } catch (e) {
    console.warn(`[home] query ${label ?? fn.name} threw:`, e instanceof Error ? e.message : e);
    return null;
  }
}

export default async function Home() {
  const [posts, caseStudies, timeline, testimonials, profile, projects, photos, hobbies] =
    await Promise.all([
      safeQuery(getPublishedPosts, "published_posts"),
      safeQuery(getCaseStudies, "case_studies"),
      safeQuery(getCareerTimeline, "career_timeline"),
      safeQuery(getTestimonials, "testimonials"),
      safeQuery(getProfile, "profile"),
      safeQuery(getPersonalProjects, "personal_projects"),
      safeQuery(getPhotoGallery, "photo_gallery"),
      safeQuery(getHobbiesInterests, "hobbies_interests"),
    ]);

  console.log("[home] data counts:", {
    posts: (posts as unknown[] | null)?.length ?? "null",
    caseStudies: (caseStudies as unknown[] | null)?.length ?? "null",
    timeline: (timeline as unknown[] | null)?.length ?? "null",
    testimonials: (testimonials as unknown[] | null)?.length ?? "null",
    profile: profile ? "found" : "null",
    projects: (projects as unknown[] | null)?.length ?? "null",
    photos: (photos as unknown[] | null)?.length ?? "null",
    hobbies: (hobbies as unknown[] | null)?.length ?? "null",
  });

  const latestPosts = (posts ?? []).slice(0, 3);
  const featuredCase = (caseStudies ?? [])[0] ?? null;

  return (
    <>
      {(testimonials ?? []).length > 0 && (
        <JsonLd data={reviewSchema(testimonials!)} />
      )}

      <ConditionalSection sectionKey="hero">
        <Hero />
      </ConditionalSection>

      <ConditionalSection sectionKey="personal_intro">
        <PersonalIntro profile={profile} />
      </ConditionalSection>

      <ConditionalSection sectionKey="now_section">
        <NowSection />
      </ConditionalSection>

      <ConditionalSection sectionKey="stats_bar">
        <KpiStats />
      </ConditionalSection>

      <ConditionalSection sectionKey="latest_insights">
        <LatestInsights posts={latestPosts} />
      </ConditionalSection>

      <ConditionalSection sectionKey="featured_case_study">
        <FeaturedCaseStudy caseStudy={featuredCase} />
      </ConditionalSection>

      <ConditionalSection sectionKey="personal_projects">
        <PersonalProjects projects={projects ?? []} />
      </ConditionalSection>

      <ConditionalSection sectionKey="photo_gallery">
        <PhotoGallery photos={photos ?? []} />
      </ConditionalSection>

      <ConditionalSection sectionKey="hobbies">
        <HobbiesSection hobbies={hobbies ?? []} />
      </ConditionalSection>

      <ConditionalSection sectionKey="career_timeline">
        <CareerTimeline entries={timeline ?? []} />
      </ConditionalSection>

      <ConditionalSection sectionKey="testimonials">
        <Testimonials testimonials={testimonials ?? []} />
      </ConditionalSection>

      <ConditionalSection sectionKey="newsletter_cta">
        <NewsletterCta />
      </ConditionalSection>
    </>
  );
}
