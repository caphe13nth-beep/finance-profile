"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import {
  Heart, Music, Camera, Gamepad2, BookOpen, Palette,
  Dumbbell, Globe, Coffee, Utensils, Plane, Mountain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────

interface Hobby {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
}

// ── Icon map ───────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  heart: Heart, music: Music, camera: Camera, gaming: Gamepad2,
  reading: BookOpen, art: Palette, fitness: Dumbbell, travel: Plane,
  coffee: Coffee, cooking: Utensils, hiking: Mountain, globe: Globe,
};

function getIcon(name: string | null): LucideIcon {
  if (!name) return Heart;
  return ICON_MAP[name.toLowerCase()] ?? Heart;
}

// ── Pastel palette — 8 hues in the accent family ───
// Light mode: high lightness, low saturation pastels
// Dark mode: low lightness, low saturation muted tints
// Each pair: [lightBg, darkBg]
const PASTELS: [string, string][] = [
  ["hsl(160 30% 94%)", "hsl(160 20% 16%)"],
  ["hsl(200 30% 94%)", "hsl(200 20% 16%)"],
  ["hsl(280 25% 94%)", "hsl(280 15% 16%)"],
  ["hsl(340 25% 94%)", "hsl(340 15% 16%)"],
  ["hsl(40  30% 94%)", "hsl(40  20% 16%)"],
  ["hsl(80  25% 94%)", "hsl(80  15% 16%)"],
  ["hsl(120 25% 94%)", "hsl(120 15% 16%)"],
  ["hsl(220 25% 94%)", "hsl(220 15% 16%)"],
];

// ── Component ──────────────────────────────────────

export function HobbiesSection({ hobbies }: { hobbies: Hobby[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("Home");

  if (hobbies.length === 0) return null;

  return (
    <section id="hobbies" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("hobbiesLabel")}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("hobbiesHeading")}
          </h2>
        </motion.div>

        {/* Auto-fill grid */}
        <div
          className="mt-10 grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {hobbies.map((hobby, i) => {
            const Icon = getIcon(hobby.icon);
            const [lightBg, darkBg] = PASTELS[i % PASTELS.length];

            return (
              <motion.div
                key={hobby.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                  delay: i * 0.06,
                }}
                className={cn(
                  "hobby-card group flex flex-col items-center rounded-2xl border border-transparent p-6 text-center",
                  "transition-all duration-300 hover:-translate-y-1.5",
                )}
                style={{
                  // Light/dark handled via CSS custom property
                  ["--hobby-bg-light" as string]: lightBg,
                  ["--hobby-bg-dark" as string]: darkBg,
                }}
              >
                {/* Icon / emoji with wiggle on hover */}
                <div className="hobby-icon relative flex items-center justify-center">
                  {hobby.icon && /\p{Emoji_Presentation}/u.test(hobby.icon) ? (
                    <span className="text-4xl" role="img" aria-hidden>
                      {hobby.icon}
                    </span>
                  ) : (
                    <Icon className="h-9 w-9 text-accent" />
                  )}

                  {/* Circular image thumbnail next to icon */}
                  {hobby.image_url && (
                    <div className="absolute -right-3 -top-2 h-7 w-7 overflow-hidden rounded-full border-2 border-background shadow-sm">
                      <Image
                        src={hobby.image_url}
                        alt=""
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-3 font-heading text-sm font-semibold text-foreground">
                  {hobby.title}
                </h3>

                {/* Description */}
                {hobby.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {hobby.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
