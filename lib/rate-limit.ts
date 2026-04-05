import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function createLimiter(maxRequests: number, window: `${number} s` | `${number} m` | `${number} h` | `${number} d`) {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, window),
    analytics: true,
  });
}

// Pre-configured limiters
const limiters = {
  contact: () => createLimiter(5, "1 h"),
  newsletter: () => createLimiter(3, "1 h"),
  reactions: () => createLimiter(30, "1 h"),
  views: () => createLimiter(60, "1 h"),
};

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Apply rate limiting to an API route.
 * Returns a NextResponse with 429 if rate limited, or null if allowed.
 * If Upstash is not configured, always allows (returns null).
 */
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof limiters
): Promise<NextResponse | null> {
  const limiter = limiters[type]();
  if (!limiter) return null; // Upstash not configured — allow all

  const ip = getIp(request);
  const { success, remaining, reset } = await limiter.limit(`${type}:${ip}`);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  return null; // Allowed
}
