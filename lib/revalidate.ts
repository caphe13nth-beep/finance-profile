/**
 * Call the revalidation API from client-side admin pages
 * after content changes to bust ISR caches on public pages.
 */
export async function revalidatePaths(paths: string[]) {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-token": process.env.NEXT_PUBLIC_REVALIDATE_SECRET ?? "",
      },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // Non-critical — ISR will eventually catch up
  }
}

/** Table → public paths that need revalidation */
export const TABLE_PATHS: Record<string, string[]> = {
  blog_posts: ["/", "/blog"],
  case_studies: ["/", "/portfolio"],
  services: ["/services"],
  testimonials: ["/"],
  market_insights: ["/insights"],
  media_appearances: ["/about"],
  career_timeline: ["/", "/about"],
  profiles: ["/", "/about"],
  resources: ["/resources"],
  newsletter_subscribers: [],
  contact_submissions: [],
  site_settings: ["/"],
};
