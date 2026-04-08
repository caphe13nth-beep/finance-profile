import { ImageResponse } from "@vercel/og";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Supabase client for edge — uses service role for reading settings
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function fetchIdentity() {
  try {
    const { data } = await db()
      .from("site_settings")
      .select("value")
      .eq("key", "site_identity")
      .single();
    return (data?.value ?? {}) as Record<string, string | null>;
  } catch {
    return {};
  }
}

async function fetchProfileName() {
  try {
    const { data } = await db()
      .from("profiles")
      .select("name, photo_url")
      .limit(1)
      .single();
    return data as { name: string; photo_url: string | null } | null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const title = searchParams.get("title") ?? "";
  const subtitle = searchParams.get("subtitle") ?? "";
  const category = searchParams.get("category") ?? "";
  const type = searchParams.get("type") ?? "default";

  // Fetch site identity + profile in parallel
  const [identity, profile] = await Promise.all([
    fetchIdentity(),
    fetchProfileName(),
  ]);

  const siteName = (identity.site_name as string) || "FinanceProfile";
  const tagline = (identity.tagline as string) || "";
  const avatarUrl = (identity.avatar_url as string) || profile?.photo_url || null;
  const coverUrl = (identity.cover_image_url as string) || null;
  const authorName = profile?.name || siteName;

  // Colors
  const bg = "#0F172A";
  const accent = "#10B981";
  const accentSecondary = "#D4A373";
  const textPrimary = "#F8FAFC";
  const textSecondary = "#94A3B8";
  const border = "rgba(248, 250, 252, 0.1)";

  // ── Blog post OG ────────────────────────────────
  if (type === "blog") {
    const displayTitle = title || "Untitled Post";
    const fontSize = displayTitle.length > 60 ? 40 : displayTitle.length > 35 ? 50 : 60;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: bg,
            fontFamily: '"Inter", "Space Grotesk", system-ui, sans-serif',
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              width: "100%",
              height: "5px",
              background: `linear-gradient(90deg, ${accent}, ${accentSecondary})`,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              padding: "50px 70px",
            }}
          >
            {/* Category badge */}
            {category && (
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: accent,
                    background: `${accent}15`,
                    padding: "5px 14px",
                    borderRadius: "16px",
                  }}
                >
                  {category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: 700,
                color: textPrimary,
                lineHeight: 1.15,
                margin: 0,
                maxWidth: "950px",
                letterSpacing: "-0.02em",
              }}
            >
              {displayTitle}
            </h1>

            {subtitle && (
              <p
                style={{
                  fontSize: "20px",
                  color: textSecondary,
                  margin: "16px 0 0 0",
                  maxWidth: "750px",
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Footer — avatar + author name + site */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 70px",
              borderTop: `1px solid ${border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Avatar */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  width={44}
                  height={44}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${accent}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${accent}, ${accentSecondary})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {authorName.charAt(0)}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  By {authorName}
                </span>
                <span style={{ fontSize: "13px", color: textSecondary }}>
                  {siteName}
                </span>
              </div>
            </div>

            {/* Decorative dots */}
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accentSecondary }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: textSecondary }} />
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  // ── Default / Homepage OG ───────────────────────
  const displayTitle = title || siteName;
  const displaySubtitle = subtitle || tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
          fontFamily: '"Inter", "Space Grotesk", system-ui, sans-serif',
          position: "relative",
        }}
      >
        {/* Cover image as background (if set) */}
        {coverUrl && (
          <img
            src={coverUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark overlay */}
        {coverUrl && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(15, 23, 42, 0.75)",
            }}
          />
        )}

        {/* Content — centered */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
            padding: "40px",
          }}
        >
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              width={96}
              height={96}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: `3px solid ${accent}`,
                marginBottom: "28px",
              }}
            />
          ) : (
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${accent}, ${accentSecondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "40px",
                fontWeight: 700,
                marginBottom: "28px",
              }}
            >
              {displayTitle.charAt(0)}
            </div>
          )}

          {/* Site name */}
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: textPrimary,
              lineHeight: 1.1,
              margin: 0,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            {displayTitle}
          </h1>

          {/* Tagline */}
          {displaySubtitle && (
            <p
              style={{
                fontSize: "22px",
                color: textSecondary,
                margin: "16px 0 0 0",
                textAlign: "center",
                maxWidth: "600px",
                lineHeight: 1.4,
              }}
            >
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "5px",
            background: `linear-gradient(90deg, ${accent}, ${accentSecondary})`,
            zIndex: 1,
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
