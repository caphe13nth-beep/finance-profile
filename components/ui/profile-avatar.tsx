"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";
type AvatarShape = "circle" | "squircle" | "hexagon";

export interface ProfileAvatarProps {
  src?: string | null;
  fallback?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}

const sizes: Record<AvatarSize, { px: number; ring: number; text: string }> = {
  sm: { px: 40, ring: 2, text: "text-xs" },
  md: { px: 56, ring: 3, text: "text-sm" },
  lg: { px: 80, ring: 3, text: "text-lg" },
  xl: { px: 120, ring: 4, text: "text-2xl" },
};

// 16-point superellipse — smooth squircle, not an octagon
const SQUIRCLE =
  "polygon(50% 0%,78.5% 1.5%,92.5% 7.5%,98.5% 21.5%,100% 50%,98.5% 78.5%,92.5% 92.5%,78.5% 98.5%,50% 100%,21.5% 98.5%,7.5% 92.5%,1.5% 78.5%,0% 50%,1.5% 21.5%,7.5% 7.5%,21.5% 1.5%)";

const HEXAGON =
  "polygon(50% 0%,93.3% 25%,93.3% 75%,50% 100%,6.7% 75%,6.7% 25%)";

const clipPaths: Record<AvatarShape, string | undefined> = {
  circle: undefined, // use border-radius instead — lets box-shadow work
  squircle: SQUIRCLE,
  hexagon: HEXAGON,
};

// border-radius for ring + glow (clip-path eats box-shadow, so the
// outer wrapper uses border-radius to approximate the shape)
const radii: Record<AvatarShape, string> = {
  circle: "9999px",
  squircle: "22%",
  hexagon: "24%",
};

// Inline SVG noise tile encoded as a data URI — used for fallback texture.
// feTurbulence produces a film-grain feel layered over the gradient.
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")";

export function ProfileAvatar({
  src,
  fallback = "?",
  size = "md",
  shape = "squircle",
  className,
}: ProfileAvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const { px, ring, text } = sizes[size];
  const clip = clipPaths[shape];
  const radius = radii[shape];
  const outer = px + ring * 2 + 4; // ring + 2px gap each side

  const showImage = !!src && !errored;
  const showFallback = !src || errored;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "avatar-root group relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: outer, height: outer }}
    >
      {/* Animated conic-gradient ring */}
      <div
        className="avatar-ring absolute inset-0"
        style={{ borderRadius: radius }}
      />

      {/* Glow bloom on hover — separate element so box-shadow isn't
          clipped by the ring's overflow or clip-path */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          borderRadius: radius,
          boxShadow: `0 0 24px 6px color-mix(in srgb, var(--accent) 35%, transparent)`,
        }}
      />

      {/* Gap mask between ring and avatar */}
      <div
        className="absolute bg-background transition-colors"
        style={{ inset: ring, borderRadius: radius }}
      />

      {/* Inner avatar — clip-path for squircle/hexagon, border-radius for circle */}
      <div
        className="relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.04]"
        style={{
          width: px,
          height: px,
          clipPath: clip,
          borderRadius: clip ? undefined : radius,
        }}
      >
        {/* Shimmer skeleton while loading */}
        {showImage && !loaded && (
          <div className="avatar-shimmer absolute inset-0" />
        )}

        {showImage && (
          <Image
            src={src}
            alt={fallback}
            fill
            sizes={`${px}px`}
            className={cn(
              "object-cover transition-opacity duration-500",
              loaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}

        {showFallback && (
          <div
            className="absolute inset-0 flex items-center justify-center font-semibold tracking-wider text-white select-none"
            style={{
              background: `${NOISE_URI}, linear-gradient(135deg, var(--accent), var(--primary))`,
            }}
          >
            <span className={text}>
              {fallback.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Compact variant for blog author cards — fixed sm size, squircle default */
export function InlineProfileAvatar(
  props: Omit<ProfileAvatarProps, "size">,
) {
  return (
    <ProfileAvatar
      size="sm"
      shape="squircle"
      {...props}
    />
  );
}
