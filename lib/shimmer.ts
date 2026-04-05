/**
 * CSS shimmer placeholder for images.
 * Returns a base64-encoded SVG with an animated gradient shimmer effect.
 * Used as blurDataURL for next/image when real blur hashes aren't available.
 */

const shimmerSvg = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1E293B" offset="20%" />
      <stop stop-color="#334155" offset="50%" />
      <stop stop-color="#1E293B" offset="80%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1E293B" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)">
    <animate attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite" />
  </rect>
</svg>`;

function toBase64(str: string): string {
  if (typeof window !== "undefined") {
    return btoa(str);
  }
  return Buffer.from(str).toString("base64");
}

export function shimmerBlur(width = 700, height = 400): string {
  return `data:image/svg+xml;base64,${toBase64(shimmerSvg(width, height))}`;
}

/** Static blur data URL for common aspect ratios */
export const SHIMMER_16_9 = shimmerBlur(1200, 675);
export const SHIMMER_4_3 = shimmerBlur(800, 600);
export const SHIMMER_SQUARE = shimmerBlur(600, 600);
