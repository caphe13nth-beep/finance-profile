/**
 * Custom Next.js image loader for Supabase Storage URLs.
 * Passes through the src directly since Supabase Storage serves
 * images via CDN and Next.js handles optimization via remotePatterns.
 *
 * Usage in next.config.ts:
 *   images: { loader: 'custom', loaderFile: './lib/supabase/image-loader.ts' }
 *
 * Or per-image:
 *   <Image loader={supabaseLoader} src={url} ... />
 */
export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // If it's a Supabase Storage URL, use Supabase's image transformation
  if (src.includes("supabase.co/storage/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    if (quality) url.searchParams.set("quality", String(quality));
    return url.toString();
  }

  // For other URLs, pass through (Next.js default optimization handles it)
  return src;
}
