"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BarChart3,
  PieChart,
  Shield,
  Target,
  Globe,
  Lightbulb,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SKILL_ICONS: Record<string, LucideIcon> = {
  analytics: BarChart3,
  portfolio: PieChart,
  risk: Shield,
  strategy: Target,
  global: Globe,
  innovation: Lightbulb,
  trading: TrendingUp,
  fintech: Zap,
};

function iconForSkill(skill: string): LucideIcon {
  const lower = skill.toLowerCase();
  for (const [key, icon] of Object.entries(SKILL_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  // Rotate through icons for unmatched skills
  const icons = Object.values(SKILL_ICONS);
  let hash = 0;
  for (let i = 0; i < skill.length; i++) hash = (hash + skill.charCodeAt(i)) % icons.length;
  return icons[hash];
}

export function SkillsGrid({ skills }: { skills: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (skills.length === 0) return null;

  return (
    <section id="skills" ref={ref} className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Expertise
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Skills &amp; Specializations
          </h2>
        </motion.div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {skills.map((skill, i) => {
            const Icon = iconForSkill(skill);
            return (
              <motion.div
                key={skill}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {skill}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
