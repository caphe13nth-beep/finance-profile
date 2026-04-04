"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { X, TrendingUp, Target, Clock, AlertTriangle, Search } from "lucide-react";

interface Insight {
  id: string;
  asset_name: string;
  sector: string | null;
  thesis_summary: string | null;
  risks: string | null;
  target_price: number | null;
  time_horizon: string | null;
  charts: ChartDef[] | null;
  published_at: string | null;
}

interface ChartDef {
  title?: string;
  type?: "line" | "bar" | "area";
  data: Record<string, unknown>[];
  dataKey?: string;
  xKey?: string;
}

function riskLevel(risks: string | null): { label: string; color: string; bg: string } {
  if (!risks) return { label: "Unknown", color: "text-muted-foreground", bg: "bg-muted" };
  const lower = risks.toLowerCase();
  if (lower.includes("high") || lower.includes("significant"))
    return { label: "High", color: "text-destructive", bg: "bg-destructive/10" };
  if (lower.includes("low") || lower.includes("minimal"))
    return { label: "Low", color: "text-accent", bg: "bg-accent/10" };
  return { label: "Medium", color: "text-chart-2", bg: "bg-chart-2/10" };
}

/* ── Card ──────────────────────────────────────────── */
function InsightCard({
  insight,
  index,
  onOpen,
}: {
  insight: Insight;
  index: number;
  onOpen: () => void;
}) {
  const risk = riskLevel(insight.risks);
  const date = insight.published_at
    ? new Date(insight.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 9) * 0.06 }}
      onClick={onOpen}
      className="group flex w-full flex-col rounded-xl border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {insight.sector && (
            <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {insight.sector}
            </span>
          )}
          <h3 className="mt-2 font-heading text-lg font-bold text-foreground transition-colors group-hover:text-accent">
            {insight.asset_name}
          </h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${risk.color} ${risk.bg}`}>
          {risk.label} Risk
        </span>
      </div>

      {insight.thesis_summary && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {insight.thesis_summary}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {insight.target_price != null && (
          <span className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono font-semibold text-foreground">
              ${insight.target_price.toLocaleString()}
            </span>
          </span>
        )}
        {insight.time_horizon && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {insight.time_horizon}
          </span>
        )}
        {date && <span>{date}</span>}
      </div>
    </motion.button>
  );
}

/* ── Chart renderer ────────────────────────────────── */
function InsightChart({ chart }: { chart: ChartDef }) {
  const xKey = chart.xKey ?? "x";
  const dataKey = chart.dataKey ?? "value";
  const type = chart.type ?? "line";

  const tooltipStyle = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
  };

  const content = (() => {
    switch (type) {
      case "bar":
        return (
          <BarChart data={chart.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={dataKey} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={chart.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={`areaGrad-${chart.title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={dataKey} stroke="var(--chart-1)" strokeWidth={2} fill={`url(#areaGrad-${chart.title})`} />
          </AreaChart>
        );
      default:
        return (
          <LineChart data={chart.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={dataKey} stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          </LineChart>
        );
    }
  })();

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      {chart.title && (
        <h4 className="mb-3 text-sm font-semibold text-muted-foreground">{chart.title}</h4>
      )}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {content}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Detail modal ──────────────────────────────────── */
function DetailModal({
  insight,
  onClose,
}: {
  insight: Insight;
  onClose: () => void;
}) {
  const risk = riskLevel(insight.risks);
  const date = insight.published_at
    ? new Date(insight.published_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const charts = (insight.charts ?? []) as ChartDef[];

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
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {insight.sector && (
                <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {insight.sector}
                </span>
              )}
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {insight.asset_name}
              </h2>
              {date && (
                <p className="mt-1 text-sm text-muted-foreground">{date}</p>
              )}
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${risk.color} ${risk.bg}`}>
              {risk.label} Risk
            </span>
          </div>

          {/* KPI row */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {insight.target_price != null && (
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <p className="font-mono text-xl font-bold text-accent">
                  ${insight.target_price.toLocaleString()}
                </p>
                <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" /> Target Price
                </p>
              </div>
            )}
            {insight.time_horizon && (
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <p className="font-mono text-xl font-bold text-foreground">
                  {insight.time_horizon}
                </p>
                <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> Time Horizon
                </p>
              </div>
            )}
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
              <p className={`font-mono text-xl font-bold ${risk.color}`}>
                {risk.label}
              </p>
              <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /> Risk Level
              </p>
            </div>
          </div>

          {/* Thesis */}
          {insight.thesis_summary && (
            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-accent">
                <TrendingUp className="h-4 w-4" />
                Investment Thesis
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {insight.thesis_summary.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {insight.risks && (
            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Key Risks
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {insight.risks.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          {charts.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Charts &amp; Data
              </h3>
              {charts.map((chart, i) => (
                <InsightChart key={i} chart={chart} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main list ─────────────────────────────────────── */
export function InsightsList({ insights }: { insights: Insight[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);

  const sectors = [...new Set(insights.map((i) => i.sector).filter(Boolean))] as string[];

  const filtered = insights.filter((i) => {
    if (sectorFilter && i.sector !== sectorFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        i.asset_name.toLowerCase().includes(q) ||
        (i.sector?.toLowerCase().includes(q) ?? false) ||
        (i.thesis_summary?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const selected = insights.find((i) => i.id === selectedId) ?? null;

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search insights..."
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {sectors.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSectorFilter(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                sectorFilter === null
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {sectors.map((s) => (
              <button
                key={s}
                onClick={() => setSectorFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  sectorFilter === s
                    ? "bg-accent text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((insight, i) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              index={i}
              onOpen={() => setSelectedId(insight.id)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          No insights match your search.
        </p>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal insight={selected} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
