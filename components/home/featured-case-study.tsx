"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, XAxis } from "recharts";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

interface CaseStudy {
  id: string;
  title: string;
  client_name: string | null;
  industry: string | null;
  challenge: string | null;
  strategy: string | null;
  result: string | null;
  kpi_metrics: Record<string, unknown> | null;
  images: string[] | null;
}

function KpiMiniChart({ metrics }: { metrics: Record<string, unknown> }) {
  const entries = Object.entries(metrics).slice(0, 5);
  const chartData = entries.map(([key, val]) => ({
    name: key,
    value: typeof val === "number" ? val : parseFloat(String(val)) || 0,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Bar
            dataKey="value"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FeaturedCaseStudy({
  caseStudy,
}: {
  caseStudy: CaseStudy | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (!caseStudy) return null;

  const metrics = caseStudy.kpi_metrics as Record<string, unknown> | null;

  return (
    <section
      id="case-study"
      ref={ref}
      className="border-y border-border bg-muted/30 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Featured Case Study
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {caseStudy.title}
          </h2>
          {caseStudy.client_name && (
            <p className="mt-1 text-muted-foreground">
              {caseStudy.client_name}
              {caseStudy.industry && (
                <span className="ml-2 text-xs">
                  &mdash; {caseStudy.industry}
                </span>
              )}
            </p>
          )}
        </motion.div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Challenge → Result */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            {caseStudy.challenge && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-destructive">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold">
                    1
                  </span>
                  Challenge
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {caseStudy.challenge}
                </p>
              </div>
            )}

            {caseStudy.strategy && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-chart-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/10 text-xs font-bold">
                    2
                  </span>
                  Strategy
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {caseStudy.strategy}
                </p>
              </div>
            )}

            {caseStudy.result && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-accent">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold">
                    3
                  </span>
                  Result
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {caseStudy.result}
                </p>
              </div>
            )}
          </motion.div>

          {/* KPI panel + chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col gap-6"
          >
            {metrics && Object.keys(metrics).length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Metrics
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {Object.entries(metrics)
                    .slice(0, 4)
                    .map(([key, val]) => (
                      <div key={key} className="text-center">
                        <p className="font-mono text-2xl font-bold text-accent">
                          {String(val)}
                        </p>
                        <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                          {key.replace(/_/g, " ")}
                        </p>
                      </div>
                    ))}
                </div>

                <div className="mt-6">
                  <KpiMiniChart metrics={metrics} />
                </div>
              </div>
            )}

            <Link
              href={`/portfolio`}
              className="inline-flex items-center gap-2 self-start rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
            >
              <TrendingUp className="h-4 w-4" />
              View All Case Studies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
