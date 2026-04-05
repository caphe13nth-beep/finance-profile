"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";
import Image from "next/image";
import { SHIMMER_16_9 } from "@/lib/shimmer";
import { X, ExternalLink } from "lucide-react";

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
  pdf_url: string | null;
}

/* ────────────────────────────────────────────────────── */
/* Card (masonry item)                                    */
/* ────────────────────────────────────────────────────── */
function CaseStudyCard({
  cs,
  index,
  onOpen,
}: {
  cs: CaseStudy;
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const metrics = cs.kpi_metrics as Record<string, unknown> | null;
  const metricEntries = metrics ? Object.entries(metrics).slice(0, 3) : [];

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 6) * 0.08 }}
      onClick={onOpen}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/60 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_40px_rgba(16,185,129,0.08)]"
    >
      {/* Top image strip */}
      {cs.images && cs.images.length > 0 ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={cs.images[0]}
            alt={cs.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={SHIMMER_16_9}
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-accent/5 to-gold/5">
          <span className="font-heading text-3xl font-bold text-muted-foreground/10">
            {cs.title.charAt(0)}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {cs.industry && (
          <span className="mb-2 inline-block self-start rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            {cs.industry}
          </span>
        )}

        <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
          {cs.title}
        </h3>

        {cs.client_name && (
          <p className="mt-1 text-sm text-muted-foreground">
            {cs.client_name}
          </p>
        )}

        {/* Inline KPI pills */}
        {metricEntries.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {metricEntries.map(([key, val]) => (
              <span
                key={key}
                className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs"
              >
                <span className="font-mono font-semibold text-foreground">
                  {String(val)}
                </span>{" "}
                <span className="text-muted-foreground capitalize">
                  {key.replace(/_/g, " ")}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

/* ────────────────────────────────────────────────────── */
/* Detail modal                                           */
/* ────────────────────────────────────────────────────── */
function KpiChart({ metrics }: { metrics: Record<string, unknown> }) {
  const data = Object.entries(metrics)
    .slice(0, 6)
    .map(([key, val]) => ({
      name: key.replace(/_/g, " "),
      value: typeof val === "number" ? val : parseFloat(String(val)) || 0,
    }));

  if (data.length === 0) return null;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DetailModal({
  cs,
  onClose,
}: {
  cs: CaseStudy;
  onClose: () => void;
}) {
  const metrics = cs.kpi_metrics as Record<string, unknown> | null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-12 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header image */}
        {cs.images && cs.images.length > 0 && (
          <div className="relative aspect-[21/9] overflow-hidden rounded-t-2xl bg-muted">
            <Image
              src={cs.images[0]}
              alt={cs.title}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          {cs.industry && (
            <span className="mb-3 inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {cs.industry}
            </span>
          )}

          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {cs.title}
          </h2>

          {cs.client_name && (
            <p className="mt-1 text-muted-foreground">{cs.client_name}</p>
          )}

          {/* KPI metrics grid */}
          {metrics && Object.keys(metrics).length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(metrics)
                .slice(0, 4)
                .map(([key, val]) => (
                  <div
                    key={key}
                    className="rounded-lg border border-border bg-muted/50 p-3 text-center"
                  >
                    <p className="font-mono text-xl font-bold text-accent">
                      {String(val)}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                      {key.replace(/_/g, " ")}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* Challenge / Strategy / Result */}
          <div className="mt-8 space-y-6">
            {cs.challenge && (
              <div>
                <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-destructive">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold">
                    1
                  </span>
                  Challenge
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cs.challenge}
                </p>
              </div>
            )}

            {cs.strategy && (
              <div>
                <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-chart-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/10 text-xs font-bold">
                    2
                  </span>
                  Strategy
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cs.strategy}
                </p>
              </div>
            )}

            {cs.result && (
              <div>
                <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-accent">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold">
                    3
                  </span>
                  Result
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {cs.result}
                </p>
              </div>
            )}
          </div>

          {/* Chart */}
          {metrics && Object.keys(metrics).length > 0 && (
            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                Performance Overview
              </h3>
              <KpiChart metrics={metrics} />
            </div>
          )}

          {/* PDF link */}
          {cs.pdf_url && (
            <a
              href={cs.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              Download Full Report
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────── */
/* Grid                                                   */
/* ────────────────────────────────────────────────────── */
export function CaseStudyGrid({
  caseStudies,
}: {
  caseStudies: CaseStudy[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = caseStudies.find((cs) => cs.id === selectedId) ?? null;

  return (
    <>
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
        {caseStudies.map((cs, i) => (
          <CaseStudyCard
            key={cs.id}
            cs={cs}
            index={i}
            onOpen={() => setSelectedId(cs.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal cs={selected} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
