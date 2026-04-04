"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Service {
  id: string;
  title: string;
  description: string | null;
  features: string[] | null;
  price: number | null;
  cta_label: string | null;
  sort_order: number;
}

export function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const features = service.features ?? [];
  const cta = service.cta_label ?? "Get Started";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_40px_rgba(16,185,129,0.08)] sm:p-8"
    >
      {/* Glass highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.07] to-transparent" />

      {/* Content */}
      <div className="relative flex flex-1 flex-col">
        <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
          {service.title}
        </h3>

        {service.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        )}

        {/* Price */}
        {service.price != null && (
          <div className="mt-5 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-bold text-foreground">
              ${service.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">/ engagement</span>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <ul className="mt-6 flex flex-col gap-2.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Check className="h-3 w-3 text-accent" />
                </span>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <div className="mt-8 pt-2">
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
