import { unstable_cache } from "next/cache";
import { createAdminClient } from "./admin";

// ── Cache config ─────────────────────────────────────────────
// Content queries: tag 'content', revalidate every 30 minutes
const CONTENT_REVALIDATE = 1800;
const CONTENT_TAGS = ["content"];

// Use admin client for cached queries (no cookies — compatible with unstable_cache)
function db() {
  return createAdminClient();
}

// ── Profiles ──────────────────────────────────────────────
export const getProfile = unstable_cache(
  async () => {
    const { data } = await db().from("profiles").select("*").limit(1).maybeSingle();
    return { data };
  },
  ["profile"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Blog Posts ────────────────────────────────────────────
export const getPublishedPosts = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    return { data, error };
  },
  ["published-posts"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

export const getPublishedPostsByLocale = unstable_cache(
  async (locale: string) => {
    const { data, error } = await db()
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .eq("locale", locale)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    return { data, error };
  },
  ["published-posts-by-locale"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

/** Get all translations of a post (siblings + original) */
export const getPostTranslations = unstable_cache(
  async (postId: string, translationOf: string | null) => {
    // The "root" id is either translation_of (if this is a translation) or the post itself
    const rootId = translationOf ?? postId;

    const { data, error } = await db()
      .from("blog_posts")
      .select("id, slug, locale, title")
      .eq("status", "published")
      .or(`id.eq.${rootId},translation_of.eq.${rootId}`)
      .order("locale", { ascending: true });
    return { data, error };
  },
  ["post-translations"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

export const getRelatedPosts = unstable_cache(
  async (postId: string, category: string | null, tags: string[] | null) => {
    const supabase = db();
    const now = new Date().toISOString();

    let query = supabase
      .from("blog_posts")
      .select("id, title, slug, featured_image, category, tags, published_at, reading_time_min, view_count")
      .eq("status", "published")
      .lte("published_at", now)
      .neq("id", postId)
      .order("published_at", { ascending: false })
      .limit(20);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: categoryMatches } = await query;
    let candidates = categoryMatches ?? [];

    if (candidates.length < 3 && tags && tags.length > 0) {
      const { data: tagMatches } = await supabase
        .from("blog_posts")
        .select("id, title, slug, featured_image, category, tags, published_at, reading_time_min, view_count")
        .eq("status", "published")
        .lte("published_at", now)
        .neq("id", postId)
        .overlaps("tags", tags)
        .order("published_at", { ascending: false })
        .limit(10);

      const seen = new Set(candidates.map((c) => c.id));
      for (const m of tagMatches ?? []) {
        if (!seen.has(m.id)) {
          candidates.push(m);
          seen.add(m.id);
        }
      }
    }

    const scored = candidates.map((c) => {
      let score = 0;
      if (category && c.category === category) score += 2;
      if (tags && c.tags) {
        const overlap = (c.tags as string[]).filter((t: string) => tags.includes(t)).length;
        score += overlap;
      }
      return { ...c, _score: score };
    });

    scored.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
    });

    return { data: scored.slice(0, 3) };
  },
  ["related-posts"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

export const getPostBySlug = unstable_cache(
  async (slug: string) => {
    const { data, error } = await db()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .single();
    return { data, error };
  },
  ["post-by-slug"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Services ──────────────────────────────────────────────
export const getServices = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data, error };
  },
  ["services"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Testimonials ──────────────────────────────────────────
export const getTestimonials = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data, error };
  },
  ["testimonials"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Case Studies ──────────────────────────────────────────
export const getCaseStudies = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("case_studies")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },
  ["case-studies"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

export const getCaseStudy = unstable_cache(
  async (id: string) => {
    const { data, error } = await db().from("case_studies").select("*").eq("id", id).single();
    return { data, error };
  },
  ["case-study"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Media Appearances ─────────────────────────────────────
export const getMediaAppearances = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("media_appearances")
      .select("*")
      .order("date", { ascending: false });
    return { data, error };
  },
  ["media-appearances"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Career Timeline ──────────────────────────────────────
export const getCareerTimeline = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("career_timeline")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data, error };
  },
  ["career-timeline"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Market Insights ──────────────────────────────────────
export const getMarketInsights = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("market_insights")
      .select("*")
      .order("published_at", { ascending: false });
    return { data, error };
  },
  ["market-insights"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Resources ────────────────────────────────────────────
export const getResources = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("resources")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data, error };
  },
  ["resources"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Personal Projects ────────────────────────────────────
export const getPersonalProjects = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("personal_projects")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data, error };
  },
  ["personal-projects"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Photo Gallery ────────────────────────────────────────
export const getPhotoGallery = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("photo_gallery")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data, error };
  },
  ["photo-gallery"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Hobbies & Interests ──────────────────────────────────
export const getHobbiesInterests = unstable_cache(
  async () => {
    const { data, error } = await db()
      .from("hobbies_interests")
      .select("*")
      .order("sort_order", { ascending: true });
    return { data, error };
  },
  ["hobbies-interests"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);

// ── Blog Reaction Counts (batch) ────────────────────────
// Returns { [post_id]: { like, insightful, fire, bookmark } }
export const getBlogReactionCounts = unstable_cache(
  async () => {
    const { data } = await db()
      .from("blog_reactions")
      .select("post_id, reaction");

    const counts: Record<string, Record<string, number>> = {};
    for (const row of data ?? []) {
      const pid = row.post_id as string;
      const r = row.reaction as string;
      if (!counts[pid]) counts[pid] = { like: 0, insightful: 0, fire: 0, bookmark: 0 };
      if (r in counts[pid]) counts[pid][r]++;
    }
    return { data: counts, error: null };
  },
  ["blog-reaction-counts"],
  { revalidate: CONTENT_REVALIDATE, tags: CONTENT_TAGS }
);
