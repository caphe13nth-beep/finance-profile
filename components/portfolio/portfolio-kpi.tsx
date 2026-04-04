"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Layers, TrendingUp, Factory } from "lucide-react";

interface PortfolioKpiProps {
  totalProjects: number;
  industries: string[];
  avgRoi: string | null;
}

export function PortfolioKpi({ totalProjects, industries, avgRoi }: PortfolioKpiProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects.toString(),
      icon: Layers,
    },
    {
      label: "Avg ROI",
      value: avgRoi ?? "—",
      icon: TrendingUp,
    },
    {
      label: "Industries",
      value: industries.length.toString(),
      icon: Factory,
    },
  ];

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
