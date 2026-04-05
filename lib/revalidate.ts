/**
 * Call the revalidation API from client-side admin pages
 * after content changes to bust caches on public pages.
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
    // Non-critical — cache will eventually expire
  }
}

/**
 * Call the revalidation API from client-side admin pages
 * to invalidate cache entries by tag.
 */
export async function revalidateTags(tags: string[]) {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-token": process.env.NEXT_PUBLIC_REVALIDATE_SECRET ?? "",
      },
      body: JSON.stringify({ tags }),
    });
  } catch {
    // Non-critical — cache will eventually expire
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
  personal_projects: ["/", "/about"],
  photo_gallery: ["/", "/about"],
  hobbies_interests: ["/", "/about"],
};
