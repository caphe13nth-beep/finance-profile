import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

const VALID_PATHS = [
  "/",
  "/about",
  "/services",
  "/portfolio",
  "/blog",
  "/insights",
  "/resources",
  "/contact",
  "/tools",
];

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-revalidate-token");

  if (!token || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let body: { paths?: string[]; tags?: string[]; all?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Expected: { paths?: string[], tags?: string[], all?: boolean }" },
      { status: 400 }
    );
  }

  const revalidated: string[] = [];

  // Revalidate all public pages
  if (body.all) {
    for (const path of VALID_PATHS) {
      revalidatePath(path);
      revalidated.push(path);
    }
    // Also revalidate dynamic blog routes
    revalidatePath("/blog/[slug]", "page");
    revalidated.push("/blog/[slug]");

    return NextResponse.json({ revalidated, timestamp: Date.now() });
  }

  // Revalidate specific paths
  if (body.paths?.length) {
    for (const path of body.paths) {
      if (typeof path !== "string") continue;
      revalidatePath(path);
      revalidated.push(path);
    }
  }

  // Revalidate specific tags
  if (body.tags?.length) {
    for (const tag of body.tags) {
      if (typeof tag !== "string") continue;
      revalidateTag(tag, "max");
      revalidated.push(`tag:${tag}`);
    }
  }

  if (revalidated.length === 0) {
    return NextResponse.json(
      { error: "No paths or tags provided. Send { paths: [\"/blog\"] } or { all: true }" },
      { status: 400 }
    );
  }

  return NextResponse.json({ revalidated, timestamp: Date.now() });
}
