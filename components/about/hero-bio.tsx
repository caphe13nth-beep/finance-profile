"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Download } from "lucide-react";

interface Profile {
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  resume_url: string | null;
}

export function HeroBio({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section id="bio" ref={ref} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-md lg:mx-0"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted">
              {profile.photo_url ? (
                <Image
                  src={profile.photo_url}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-heading font-bold text-muted-foreground/20">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            {/* Decorative accent border */}
            <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl border-2 border-accent/20" />
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              About
            </p>
            <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              {profile.name}
            </h1>
            {profile.title && (
              <p className="mt-2 text-lg text-muted-foreground">
                {profile.title}
              </p>
            )}

            {profile.bio && (
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                {profile.bio.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
