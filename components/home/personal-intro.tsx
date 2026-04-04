"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

interface Profile {
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
}

export function PersonalIntro({ profile }: { profile: Profile | null }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (!profile) return null;

  return (
    <section id="personal-intro" ref={ref} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-sm lg:mx-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
              {profile.photo_url ? (
                <Image
                  src={profile.photo_url}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-heading font-bold text-muted-foreground/20">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Hey, I'm
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {profile.name}
            </h2>
            {profile.title && (
              <p className="mt-2 text-lg text-muted-foreground">
                {profile.title}
              </p>
            )}
            {profile.bio && (
              <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
                {profile.bio.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
