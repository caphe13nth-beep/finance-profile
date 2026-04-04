"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Download, Heart, Lightbulb, Smile, Sparkles } from "lucide-react";
import { HobbiesSection } from "@/components/home/hobbies-section";
import { PhotoGallery } from "@/components/home/photo-gallery";

interface Profile {
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  resume_url: string | null;
  skills: string[];
  certifications: Certification[];
}

interface Certification {
  name: string;
  issuer?: string;
  year?: number | string;
  url?: string;
}

interface TimelineEntry {
  id: string;
  year: number;
  title: string;
  organization: string | null;
  description: string | null;
  sort_order: number;
}

interface Photo {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
}

interface Hobby {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
}

// ── Personal Story Bio (warm, long-form) ────────────
function PersonalStory({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-md lg:col-span-2 lg:mx-0"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted">
              {profile.photo_url ? (
                <Image src={profile.photo_url} alt={profile.name} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-heading font-bold text-muted-foreground/20">{profile.name.charAt(0)}</div>
              )}
            </div>
            <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl border-2 border-accent/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">My Story</p>
            <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">{profile.name}</h1>
            {profile.title && <p className="mt-2 text-lg text-muted-foreground">{profile.title}</p>}
            {profile.bio && (
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                {profile.bio.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Fun Facts ───────────────────────────────────────
function FunFacts() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const facts = [
    { emoji: "☕", text: "Powered by an unreasonable amount of coffee" },
    { emoji: "🌍", text: "Lived in 3 countries across 2 continents" },
    { emoji: "📚", text: "Read 30+ books a year" },
    { emoji: "🎵", text: "Always listening to lo-fi while working" },
  ];

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Fun Facts</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">A Few Things About Me</h2>
        </motion.div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {facts.map((fact, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5 text-center">
              <span className="text-3xl">{fact.emoji}</span>
              <p className="mt-2 text-sm text-muted-foreground">{fact.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Personal Values ─────────────────────────────────
function PersonalValues() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const values = [
    { icon: Heart, title: "Authenticity", description: "Being genuine in everything I do" },
    { icon: Lightbulb, title: "Curiosity", description: "Always learning, always questioning" },
    { icon: Smile, title: "Kindness", description: "Leading with empathy and care" },
    { icon: Sparkles, title: "Excellence", description: "Doing meaningful work that matters" },
  ];

  return (
    <section ref={ref} className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Values</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">What I Stand For</h2>
        </motion.div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {values.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5">
              <v.icon className="h-8 w-8 text-accent" />
              <h3 className="mt-3 font-heading font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Professional Bio (finance-oriented) ─────────────
function ProfessionalBio({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-md lg:mx-0"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted">
              {profile.photo_url ? (
                <Image src={profile.photo_url} alt={profile.name} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-heading font-bold text-muted-foreground/20">{profile.name.charAt(0)}</div>
              )}
            </div>
            <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl border-2 border-accent/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">About</p>
            <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">{profile.name}</h1>
            {profile.title && <p className="mt-2 text-lg text-muted-foreground">{profile.title}</p>}
            {profile.bio && (
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                {profile.bio.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
            {profile.resume_url && (
              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/80">
                <Download className="h-4 w-4" /> Download CV
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Skills Grid (inline to avoid circular deps) ─────
function SkillsInline({ skills }: { skills: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (skills.length === 0) return null;

  return (
    <section ref={ref} className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Expertise</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Skills &amp; Specializations</h2>
        </motion.div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {skills.map((skill, i) => (
            <motion.div key={skill} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.04 }} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40">
              {skill}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Certifications (inline) ─────────────────────────
function CertsInline({ certifications }: { certifications: Certification[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (certifications.length === 0) return null;

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Credentials</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Certifications &amp; Licenses</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, i) => (
            <motion.div key={`${cert.name}-${i}`} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading font-semibold">{cert.name}</h3>
              {cert.issuer && <p className="mt-0.5 text-sm text-muted-foreground">{cert.issuer}</p>}
              {cert.year && <p className="mt-1 font-mono text-xs text-muted-foreground/70">{cert.year}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Career Timeline (inline) ────────────────────────
function TimelineInline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (entries.length === 0) return null;

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Career</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Professional Journey</h2>
        </motion.div>
        <div className="mt-12 max-w-2xl">
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.08 }} className="relative flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-background">
                  <span className="font-mono text-xs font-bold text-accent">{String(entry.year).slice(-2)}</span>
                </div>
                {i < entries.length - 1 && <div className="w-px flex-1 bg-border" />}
              </div>
              <div className={i < entries.length - 1 ? "pb-10" : ""}>
                <span className="inline-block rounded-full bg-accent/10 px-3 py-0.5 font-mono text-xs font-semibold text-accent">{entry.year}</span>
                <h3 className="mt-2 font-heading text-lg font-semibold">{entry.title}</h3>
                {entry.organization && <p className="text-sm text-muted-foreground">{entry.organization}</p>}
                {entry.description && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{entry.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main layout component ───────────────────────────
export function AboutLayout({
  mode,
  profile,
  timeline,
  photos,
  hobbies,
}: {
  mode: "personal" | "finance" | "hybrid";
  profile: Profile;
  timeline: TimelineEntry[];
  photos: Photo[];
  hobbies: Hobby[];
}) {
  if (mode === "personal") {
    return (
      <>
        <PersonalStory profile={profile} />
        <PersonalValues />
        {photos.length > 0 && <PhotoGallery photos={photos} />}
        {hobbies.length > 0 && <HobbiesSection hobbies={hobbies} />}
        <FunFacts />
      </>
    );
  }

  if (mode === "finance") {
    return (
      <>
        <ProfessionalBio profile={profile} />
        <SkillsInline skills={profile.skills} />
        <TimelineInline entries={timeline} />
        <CertsInline certifications={profile.certifications} />
      </>
    );
  }

  // hybrid — personal story first, then professional details
  return (
    <>
      <PersonalStory profile={profile} />
      <PersonalValues />
      <SkillsInline skills={profile.skills} />
      <TimelineInline entries={timeline} />
      <CertsInline certifications={profile.certifications} />
      {photos.length > 0 && <PhotoGallery photos={photos} />}
      {hobbies.length > 0 && <HobbiesSection hobbies={hobbies} />}
    </>
  );
}
