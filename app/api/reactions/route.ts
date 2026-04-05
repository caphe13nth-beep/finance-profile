import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

function getVisitorId(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  const existing = cookieStore.get("visitor_id")?.value;
  if (existing) return existing;
  return crypto.randomUUID();
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "reactions");
  if (limited) return limited;

  try {
    const { post_id, reaction } = await request.json();

    if (!post_id || !reaction) {
      return NextResponse.json({ error: "post_id and reaction required" }, { status: 400 });
    }

    const validReactions = ["like", "insightful", "fire", "bookmark"];
    if (!validReactions.includes(reaction)) {
      return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const visitorId = getVisitorId(cookieStore);

    const supabase = createAdminClient();

    // Check if reaction exists
    const { data: existing } = await supabase
      .from("blog_reactions")
      .select("id")
      .eq("post_id", post_id)
      .eq("reaction", reaction)
      .eq("visitor_id", visitorId)
      .maybeSingle();

    let toggled: boolean;

    if (existing) {
      // Remove reaction (toggle off)
      await supabase.from("blog_reactions").delete().eq("id", existing.id);
      toggled = false;
    } else {
      // Add reaction (toggle on)
      await supabase.from("blog_reactions").insert({
        post_id,
        reaction,
        visitor_id: visitorId,
      });
      toggled = true;
    }

    // Get updated counts
    const { data: counts } = await supabase
      .from("blog_reactions")
      .select("reaction")
      .eq("post_id", post_id);

    const reactionCounts: Record<string, number> = {
      like: 0, insightful: 0, fire: 0, bookmark: 0,
    };
    (counts ?? []).forEach((r) => {
      if (r.reaction in reactionCounts) reactionCounts[r.reaction]++;
    });

    // Get user's active reactions
    const { data: userReactions } = await supabase
      .from("blog_reactions")
      .select("reaction")
      .eq("post_id", post_id)
      .eq("visitor_id", visitorId);

    const activeReactions = (userReactions ?? []).map((r) => r.reaction);

    // Set visitor_id cookie if new
    const response = NextResponse.json({
      toggled,
      counts: reactionCounts,
      active: activeReactions,
    });

    if (!cookieStore.get("visitor_id")) {
      response.cookies.set("visitor_id", visitorId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
  }
}

// GET: fetch counts + user's active reactions for a post
export async function GET(request: NextRequest) {
  try {
    const postId = request.nextUrl.searchParams.get("post_id");
    if (!postId) {
      return NextResponse.json({ error: "post_id required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const visitorId = cookieStore.get("visitor_id")?.value ?? "";

    const supabase = createAdminClient();

    const [{ data: counts }, { data: userReactions }] = await Promise.all([
      supabase.from("blog_reactions").select("reaction").eq("post_id", postId),
      visitorId
        ? supabase.from("blog_reactions").select("reaction").eq("post_id", postId).eq("visitor_id", visitorId)
        : Promise.resolve({ data: [] }),
    ]);

    const reactionCounts: Record<string, number> = {
      like: 0, insightful: 0, fire: 0, bookmark: 0,
    };
    (counts ?? []).forEach((r) => {
      if (r.reaction in reactionCounts) reactionCounts[r.reaction]++;
    });

    return NextResponse.json({
      counts: reactionCounts,
      active: (userReactions ?? []).map((r) => r.reaction),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
  }
}
