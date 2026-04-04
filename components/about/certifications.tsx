"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Award } from "lucide-react";

interface Certification {
  name: string;
  issuer?: string;
  year?: number | string;
  url?: string;
}

export function Certifications({
  certifications,
}: {
  certifications: Certification[];
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (certifications.length === 0) return null;

  return (
    <section id="certifications" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Credentials
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Certifications &amp; Licenses
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, i) => (
            <motion.div
              key={`${cert.name}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-chart-2/10">
                <Award className="h-6 w-6 text-chart-2" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {cert.url ? (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-accent"
                    >
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </h3>
                {cert.issuer && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {cert.issuer}
                  </p>
                )}
                {cert.year && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground/70">
                    {cert.year}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
