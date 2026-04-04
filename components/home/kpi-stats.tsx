"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import {
  Clock,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Target,
  PieChart,
  Briefcase,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSettings } from "@/lib/settings-provider";

const ICON_MAP: Record<string, LucideIcon> = {
  clock: Clock,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  users: Users,
  "file-text": FileText,
  "bar-chart": BarChart3,
  target: Target,
  "pie-chart": PieChart,
  briefcase: Briefcase,
  zap: Zap,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? TrendingUp;
}

function generateSparkline(value: number): number[] {
  const points = 12;
  return Array.from({ length: points }, (_, i) =>
    Math.round((value * (i + 1)) / points * (0.8 + Math.random() * 0.4))
  );
}

function AnimatedCounter({
  value,
  prefix,
  suffix,
  inView,
}: {
  value: number;
  prefix: string;
  suffix: string;
  inView: boolean;
}) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      duration: 2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [inView, motionVal, value]);

  useEffect(() => {
    return rounded.on("change", (v) => setDisplay(v));
  }, [rounded]);

  return (
    <span className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${color})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({ icon, label, value, prefix, suffix, index }: {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = icon;
  const color = index % 2 === 0 ? "var(--chart-1)" : "var(--chart-2)";
  const sparkline = generateSparkline(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-5 w-5 text-accent" />
        </div>
      </div>
      <div className="mt-4">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} inView={inView} />
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="mt-3">
        <Sparkline data={sparkline} color={color} />
      </div>
    </motion.div>
  );
}

export function KpiStats() {
  const { stats_bar } = useSettings();

  return (
    <section id="stats" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {stats_bar.stats.map((stat, i) => (
            <KpiCard
              key={stat.label}
              icon={getIcon(stat.icon)}
              label={stat.label}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
