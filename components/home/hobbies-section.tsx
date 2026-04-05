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

interface Hobby {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  heart: Heart, music: Music, camera: Camera, gaming: Gamepad2,
  reading: BookOpen, art: Palette, fitness: Dumbbell, travel: Plane,
  coffee: Coffee, cooking: Utensils, hiking: Mountain, globe: Globe,
};

function getIcon(name: string | null): LucideIcon {
  if (!name) return Heart;
  return ICON_MAP[name.toLowerCase()] ?? Heart;
}

export function HobbiesSection({ hobbies }: { hobbies: Hobby[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("Home");

  if (hobbies.length === 0) return null;

  return (
    <section id="hobbies" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {hobbies.map((hobby, i) => {
            const Icon = getIcon(hobby.icon);
            return (
              <motion.div
                key={hobby.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
              >
                {hobby.image_url ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={hobby.image_url}
                      alt={hobby.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-accent/5 to-chart-2/5">
                    <Icon className="h-10 w-10 text-accent/30" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-accent" />
                    <h3 className="font-heading text-sm font-semibold">{hobby.title}</h3>
                  </div>
                  {hobby.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {hobby.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
