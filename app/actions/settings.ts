"use server";

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateSetting(key: string, value: unknown) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", key);

  if (error) return { error: error.message };

  // Invalidate all cached settings across the site
  revalidateTag("settings", { expire: 0 });
  return { error: null };
}
