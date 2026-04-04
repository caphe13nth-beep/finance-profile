import { createClient } from "./server";

// ── Profiles ──────────────────────────────────────────────
export async function getProfile() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").limit(1).maybeSingle();
  return { data };
}

// ── Blog Posts ────────────────────────────────────────────
export async function getPublishedPosts() {
  const supabase = await createClient();
  return supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
}

export async function getRelatedPosts(postId: string, category: string | null, tags: string[] | null) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Fetch candidates: same category OR overlapping tags, exclude current
  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, featured_image, category, tags, published_at, reading_time_min, view_count")
    .eq("status", "published")
    .lte("published_at", now)
    .neq("id", postId)
    .order("published_at", { ascending: false })
    .limit(20);

  // If we have a category, filter by it first
  if (category) {
    query = query.eq("category", category);
  }

  const { data: categoryMatches } = await query;

  // If we got enough from category, score and return top 3
  let candidates = categoryMatches ?? [];

  // If not enough from category alone, fetch by overlapping tags
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

    // Merge, deduplicate
    const seen = new Set(candidates.map((c) => c.id));
    for (const m of tagMatches ?? []) {
      if (!seen.has(m.id)) {
        candidates.push(m);
        seen.add(m.id);
      }
    }
  }

  // Score: category match = 2pts, each overlapping tag = 1pt
  const scored = candidates.map((c) => {
    let score = 0;
    if (category && c.category === category) score += 2;
    if (tags && c.tags) {
      const overlap = (c.tags as string[]).filter((t: string) => tags.includes(t)).length;
      score += overlap;
    }
    return { ...c, _score: score };
  });

  // Sort by score desc, then published_at desc
  scored.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
  });

  return { data: scored.slice(0, 3) };
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .single();
}

// ── Services ──────────────────────────────────────────────
export async function getServices() {
  const supabase = await createClient();
  return supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Testimonials ──────────────────────────────────────────
export async function getTestimonials() {
  const supabase = await createClient();
  return supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Case Studies ──────────────────────────────────────────
export async function getCaseStudies() {
  const supabase = await createClient();
  return supabase
    .from("case_studies")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getCaseStudy(id: string) {
  const supabase = await createClient();
  return supabase.from("case_studies").select("*").eq("id", id).single();
}

// ── Media Appearances ─────────────────────────────────────
export async function getMediaAppearances() {
  const supabase = await createClient();
  return supabase
    .from("media_appearances")
    .select("*")
    .order("date", { ascending: false });
}

// ── Career Timeline ──────────────────────────────────────
export async function getCareerTimeline() {
  const supabase = await createClient();
  return supabase
    .from("career_timeline")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Market Insights ──────────────────────────────────────
export async function getMarketInsights() {
  const supabase = await createClient();
  return supabase
    .from("market_insights")
    .select("*")
    .order("published_at", { ascending: false });
}

// ── Resources ────────────────────────────────────────────
export async function getResources() {
  const supabase = await createClient();
  return supabase
    .from("resources")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Personal Projects ────────────────────────────────────
export async function getPersonalProjects() {
  const supabase = await createClient();
  return supabase
    .from("personal_projects")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Photo Gallery ────────────────────────────────────────
export async function getPhotoGallery() {
  const supabase = await createClient();
  return supabase
    .from("photo_gallery")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Hobbies & Interests ──────────────────────────────────
export async function getHobbiesInterests() {
  const supabase = await createClient();
  return supabase
    .from("hobbies_interests")
    .select("*")
    .order("sort_order", { ascending: true });
}
