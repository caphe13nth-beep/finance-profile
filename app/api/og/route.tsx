import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const title = searchParams.get("title") ?? "FinanceProfile";
  const subtitle = searchParams.get("subtitle") ?? "";
  const type = searchParams.get("type") ?? "default";

  // Theme colors — dark mode style for OG images
  const bg = "#0F172A";
  const accent = "#10B981";
  const accentSecondary = "#D4A373";
  const textPrimary = "#F8FAFC";
  const textSecondary = "#94A3B8";
  const cardBg = "#1E293B";
  const border = "rgba(248, 250, 252, 0.1)";

  const siteName = "FinanceProfile";

  // Type-specific accent bar color
  const accentColor = type === "blog" ? accent : type === "page" ? accentSecondary : accent;

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
          fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
          padding: 0,
        }}
      >
        {/* Accent bar at top */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: `linear-gradient(90deg, ${accentColor}, ${accentSecondary})`,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "60px 70px",
          }}
        >
          {/* Type badge */}
          {type !== "default" && (
            <div
              style={{
                display: "flex",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: accentColor,
                  background: `${accentColor}15`,
                  padding: "6px 16px",
                  borderRadius: "20px",
                }}
              >
                {type === "blog" ? "Article" : "Page"}
              </span>
            </div>
          )}

          {/* Title */}
          <h1
            style={{
              fontSize: title.length > 60 ? "42px" : title.length > 35 ? "52px" : "64px",
              fontWeight: 700,
              color: textPrimary,
              lineHeight: 1.15,
              margin: 0,
              maxWidth: "900px",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              style={{
                fontSize: "22px",
                color: textSecondary,
                margin: "20px 0 0 0",
                maxWidth: "750px",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 70px",
            borderTop: `1px solid ${border}`,
          }}
        >
          {/* Logo + site name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              ↗
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: textPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              {siteName}
            </span>
          </div>

          {/* Decorative dots */}
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accentSecondary }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: textSecondary }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
