import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { post_id } = await request.json();

    if (!post_id || typeof post_id !== "string") {
      return NextResponse.json({ error: "post_id required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.rpc("increment_view_count", { row_id: post_id });

    // Fallback if RPC doesn't exist — use raw update
    if (error) {
      const { data: post } = await supabase
        .from("blog_posts")
        .select("view_count")
        .eq("id", post_id)
        .single();

      if (post) {
        await supabase
          .from("blog_posts")
          .update({ view_count: (post.view_count ?? 0) + 1 })
          .eq("id", post_id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to increment view" }, { status: 500 });
  }
}
