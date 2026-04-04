import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const admin = createAdminClient();

    // Check each table
    const tables = [
      "personal_projects",
      "photo_gallery",
      "hobbies_interests",
      "case_studies",
      "career_timeline",
      "testimonials",
      "blog_posts",
      "profiles",
      "site_settings",
    ];

    for (const table of tables) {
      try {
        const { data, error, count } = await admin
          .from(table)
          .select("*", { count: "exact" })
          .limit(2);

        results[table] = {
          count: count ?? data?.length ?? 0,
          error: error?.message ?? null,
          sample: data?.slice(0, 1).map((row: Record<string, unknown>) => {
            // Show column names only, not values
            return Object.keys(row);
          }) ?? [],
        };
      } catch (e) {
        results[table] = {
          error: e instanceof Error ? e.message : "Unknown error",
        };
      }
    }

    // Check section_visibility
    try {
      const { data } = await admin
        .from("site_settings")
        .select("value")
        .eq("key", "section_visibility")
        .single();
      results.section_visibility = data?.value ?? "NOT FOUND";
    } catch (e) {
      results.section_visibility = `ERROR: ${e instanceof Error ? e.message : e}`;
    }

    // Test the actual queries used by the homepage
    try {
      const { data, error } = await admin.from("photo_gallery").select("*").order("sort_order");
      results.photo_gallery_query = { rows: data?.length ?? 0, error: error?.message ?? null };
    } catch (e) {
      results.photo_gallery_query = `ERROR: ${e instanceof Error ? e.message : e}`;
    }

    try {
      const { data, error } = await admin.from("hobbies_interests").select("*").order("sort_order");
      results.hobbies_query = { rows: data?.length ?? 0, error: error?.message ?? null };
    } catch (e) {
      results.hobbies_query = `ERROR: ${e instanceof Error ? e.message : e}`;
    }

    try {
      const { data, error } = await admin.from("personal_projects").select("*").order("sort_order");
      results.projects_query = { rows: data?.length ?? 0, error: error?.message ?? null };
    } catch (e) {
      results.projects_query = `ERROR: ${e instanceof Error ? e.message : e}`;
    }

  } catch (e) {
    results._global_error = e instanceof Error ? e.message : "Admin client failed";
  }

  return NextResponse.json(results, { status: 200 });
}
