"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { TABLE_PATHS } from "@/lib/revalidate";

type TableName =
  | "profiles"
  | "blog_posts"
  | "case_studies"
  | "services"
  | "testimonials"
  | "market_insights"
  | "newsletter_subscribers"
  | "contact_submissions"
  | "media_appearances"
  | "career_timeline"
  | "resources"
  | "personal_projects"
  | "photo_gallery"
  | "hobbies_interests";

function admin() {
  return createAdminClient();
}

function revalidateRelated(table: TableName, adminPath: string) {
  revalidatePath(adminPath);
  const publicPaths = TABLE_PATHS[table] ?? [];
  for (const p of publicPaths) {
    revalidatePath(p);
  }
}

export async function adminCreate(
  table: TableName,
  data: Record<string, unknown>,
  revalidate: string
) {
  const { error } = await admin().from(table).insert(data);
  if (error) return { error: error.message };
  revalidateRelated(table, revalidate);
  return { error: null };
}

export async function adminUpdate(
  table: TableName,
  id: string,
  data: Record<string, unknown>,
  revalidate: string
) {
  const { error } = await admin().from(table).update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidateRelated(table, revalidate);
  return { error: null };
}

export async function adminDeleteRow(
  table: TableName,
  id: string,
  revalidate: string
) {
  const { error } = await admin().from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateRelated(table, revalidate);
  return { error: null };
}

export async function adminToggleField(
  table: TableName,
  id: string,
  field: string,
  value: boolean,
  revalidate: string
) {
  const { error } = await admin()
    .from(table)
    .update({ [field]: value })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateRelated(table, revalidate);
  return { error: null };
}

export async function adminReorder(
  table: TableName,
  items: { id: string; sort_order: number }[],
  revalidate: string
) {
  const db = admin();
  for (const item of items) {
    await db.from(table).update({ sort_order: item.sort_order }).eq("id", item.id);
  }
  revalidateRelated(table, revalidate);
  return { error: null };
}
