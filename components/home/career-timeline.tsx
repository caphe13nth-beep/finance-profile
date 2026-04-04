"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Briefcase } from "lucide-react";

interface TimelineEntry {
  id: string;
  year: number;
  title: string;
  organization: string | null;
  description: string | null;
  sort_order: number;
}

function TimelineItem({
  entry,
  index,
  isLast,
}: {
  entry: TimelineEntry;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative flex gap-6"
    >
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-background">
          <Briefcase className="h-4 w-4 text-accent" />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-10 ${isLast ? "pb-0" : ""}`}>
        <span className="inline-block rounded-full bg-accent/10 px-3 py-0.5 font-mono text-xs font-semibold text-accent">
          {entry.year}
        </span>
        <h3 className="mt-2 font-heading text-lg font-semibold text-foreground">
          {entry.title}
        </h3>
        {entry.organization && (
          <p className="text-sm font-medium text-muted-foreground">
            {entry.organization}
          </p>
        )}
        {entry.description && (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {entry.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function CareerTimeline({
  entries,
}: {
  entries: TimelineEntry[];
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="timeline" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Career
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Professional Journey
          </h2>
        </motion.div>

        <div className="mt-12 max-w-2xl">
          {entries.length > 0 ? (
            entries.map((entry, i) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                index={i}
                isLast={i === entries.length - 1}
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              Timeline entries coming soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
